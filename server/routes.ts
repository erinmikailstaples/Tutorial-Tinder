import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchStarredList, fetchReadme, starRepository, unstarRepository, checkIfStarred } from "./github";
import { getListById, DEFAULT_LIST_ID } from "@shared/lists";
import { generateProjectSuggestions } from "./ai";
import type { ProjectSuggestion } from "@shared/schema";

// In-memory cache for Reddit list to avoid GitHub rate limits
let redditListCache: { repositories: any[]; timestamp: number } | null = null;
const REDDIT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// In-memory cache for AI suggestions to avoid repeated API calls
const aiSuggestionsCache = new Map<string, { data: ProjectSuggestion; timestamp: number }>();
const AI_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch all available lists
  app.get("/api/lists", async (req, res) => {
    try {
      const { LISTS } = await import("@shared/lists");
      res.json({
        lists: LISTS.map(list => ({
          id: list.id,
          name: list.name,
          description: list.description,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching lists:", error);
      res.status(500).json({ 
        error: "Failed to fetch lists",
        message: error.message 
      });
    }
  });

  // Fetch repositories from the starred list or Reddit
  app.get("/api/repos", async (req, res) => {
    try {
      const listId = (req.query.listId as string) || DEFAULT_LIST_ID;
      const list = getListById(listId);
      
      console.log(`[API] Fetching repos for listId: ${listId}`);
      
      if (!list) {
        return res.status(400).json({ 
          error: "Invalid list ID",
          message: `List '${listId}' not found` 
        });
      }

      console.log(`[API] List found: ${list.name}, repos to filter: ${list.repos?.length || 0}`);

      let repositories: any[] = [];

      // Handle Reddit list specially - it's pre-curated and not a real GitHub starred list
      if (listId === 'reddit-cool') {
        console.log('[API] Using pre-curated Reddit list (Reddit blocks Replit infrastructure)');
        
        if (!list.repos || list.repos.length === 0) {
          return res.status(500).json({ 
            error: "Reddit list not configured",
            message: "Pre-curated repos not found" 
          });
        }

        // Check cache first to avoid rate limits
        const now = Date.now();
        if (redditListCache && (now - redditListCache.timestamp < REDDIT_CACHE_TTL)) {
          console.log('[API] Using cached Reddit repos');
          repositories = redditListCache.repositories;
        } else {
          console.log('[API] Cache miss or expired, fetching Reddit repos from GitHub');
          
          // Fetch repo details from GitHub for the pre-curated list
          const { getUncachableGitHubClient } = await import('./github');
          const octokit = await getUncachableGitHubClient();
          
          const repoPromises = list.repos.map(async (fullName) => {
            const [owner, repo] = fullName.split('/');
            try {
              const { data } = await octokit.rest.repos.get({ owner, repo });
              return data;
            } catch (error) {
              console.warn(`[API] Failed to fetch ${fullName}:`, error);
              return null;
            }
          });
          
          const repoResults = await Promise.all(repoPromises);
          repositories = repoResults.filter(r => r !== null);
          
          // Cache the results
          redditListCache = {
            repositories,
            timestamp: now
          };
          
          console.log(`[API] Fetched and cached ${repositories.length} repos for Reddit list`);
        }
      } else {
        // Handle regular lists from GitHub starred repos
        if (!list.username || !list.listName) {
          return res.status(400).json({ 
            error: "Invalid list configuration",
            message: "List must have username and listName" 
          });
        }

        const allRepos = await fetchStarredList(list.username, list.listName);
        console.log(`[API] Fetched ${allRepos.length} total starred repos from GitHub`);
        
        // Normalize repos (handle both {starred_at, repo} and direct repo formats)
        const normalizedRepos = allRepos.map((item: any) => {
          return 'full_name' in item ? item : item.repo;
        });
        
        // Filter to only include repos in this list (if repos array is provided)
        repositories = normalizedRepos;
        if (list.repos && list.repos.length > 0) {
          const repoSet = new Set(list.repos);
          repositories = normalizedRepos.filter((repo: any) => repoSet.has(repo.full_name));
          console.log(`[API] Filtered to ${repositories.length} repos for list ${listId}`);
          console.log(`[API] Repos: ${repositories.map((r: any) => r.full_name).join(', ')}`);
        }
      }
      
      res.json({
        repositories,
        total: repositories.length,
        listId: list.id,
        listName: list.name,
      });
    } catch (error: any) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ 
        error: "Failed to fetch repositories",
        message: error.message 
      });
    }
  });

  // Fetch README preview for a specific repository
  app.get("/api/readme/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const readme = await fetchReadme(owner, repo);
      
      if (!readme) {
        return res.status(404).json({ error: "README not found" });
      }

      // Decode base64 content
      const content = Buffer.from(readme.content, 'base64').toString('utf-8');
      
      // Create a preview (first 300-500 chars)
      const preview = content.slice(0, 500).trim();
      
      res.json({
        preview,
        full: content,
      });
    } catch (error: any) {
      console.error(`Error fetching README for ${req.params.owner}/${req.params.repo}:`, error);
      res.status(500).json({ 
        error: "Failed to fetch README",
        message: error.message 
      });
    }
  });

  // Generate AI project suggestions for a repository
  app.get("/api/suggestions/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const cacheKey = `${owner}/${repo}`;
      
      // Check cache first
      const now = Date.now();
      const cached = aiSuggestionsCache.get(cacheKey);
      if (cached && (now - cached.timestamp < AI_CACHE_TTL)) {
        console.log(`[AI] Using cached suggestions for ${cacheKey}`);
        return res.json(cached.data);
      }
      
      console.log(`[AI] Generating suggestions for ${cacheKey}`);
      
      // Fetch README to provide context
      const readme = await fetchReadme(owner, repo);
      if (!readme) {
        return res.status(404).json({ 
          error: "README not found",
          message: "Cannot generate suggestions without README" 
        });
      }
      
      const content = Buffer.from(readme.content, 'base64').toString('utf-8');
      const preview = content.slice(0, 1000).trim(); // Use more content for better AI context
      
      // Fetch basic repo info from GitHub
      const { getUncachableGitHubClient } = await import('./github');
      const octokit = await getUncachableGitHubClient();
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      
      // Generate AI suggestions
      const suggestions = await generateProjectSuggestions(
        repoData.name,
        repoData.description,
        preview
      );
      
      // Cache the result
      aiSuggestionsCache.set(cacheKey, {
        data: suggestions,
        timestamp: now
      });
      
      res.json(suggestions);
    } catch (error: any) {
      console.error(`Error generating suggestions for ${req.params.owner}/${req.params.repo}:`, error);
      res.status(500).json({ 
        error: "Failed to generate suggestions",
        message: error.message 
      });
    }
  });

  // Check if a repository is starred by the authenticated user
  app.get("/api/star/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const isStarred = await checkIfStarred(owner, repo);
      
      res.json({ starred: isStarred });
    } catch (error: any) {
      console.error(`Error checking star status for ${req.params.owner}/${req.params.repo}:`, error);
      res.status(500).json({ 
        error: "Failed to check star status",
        message: error.message 
      });
    }
  });

  // Star a repository for the authenticated user
  app.post("/api/star/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      await starRepository(owner, repo);
      
      res.json({ 
        success: true,
        message: `Successfully starred ${owner}/${repo}` 
      });
    } catch (error: any) {
      console.error(`Error starring ${req.params.owner}/${req.params.repo}:`, error);
      
      // Provide helpful error message
      if (error.status === 401) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Please connect your GitHub account to star repositories" 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to star repository",
        message: error.message 
      });
    }
  });

  // Unstar a repository for the authenticated user
  app.delete("/api/star/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      await unstarRepository(owner, repo);
      
      res.json({ 
        success: true,
        message: `Successfully unstarred ${owner}/${repo}` 
      });
    } catch (error: any) {
      console.error(`Error unstarring ${req.params.owner}/${req.params.repo}:`, error);
      res.status(500).json({ 
        error: "Failed to unstar repository",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
