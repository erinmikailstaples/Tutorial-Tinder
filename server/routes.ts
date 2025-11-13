import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchStarredList, fetchReadme } from "./github";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch repositories from the starred list
  app.get("/api/repos", async (req, res) => {
    try {
      const username = "erinmikailstaples";
      const repositories = await fetchStarredList(username, "beginner-friendly");
      
      res.json({
        repositories,
        total: repositories.length,
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
