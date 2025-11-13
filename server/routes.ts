import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchStarredList, fetchReadme, getUncachableGitHubClient } from "./github";
import { getListById, DEFAULT_LIST_ID } from "@shared/lists";
import { fetchCoolGitHubProjects } from "./reddit";

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

      // Handle Reddit list specially
      if (listId === 'reddit-cool') {
        console.log('[API] Fetching from Reddit');
        const repoNames = await fetchCoolGitHubProjects(100);
        console.log(`[API] Got ${repoNames.length} repo names from Reddit`);
        
        // Fetch repo details from GitHub for each repo
        const octokit = await getUncachableGitHubClient();
        const repoPromises = repoNames.slice(0, 50).map(async (fullName) => {
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
        console.log(`[API] Successfully fetched ${repositories.length} repos from Reddit list`);
      } else {
        // Handle starred lists from GitHub
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

  const httpServer = createServer(app);
  return httpServer;
}
