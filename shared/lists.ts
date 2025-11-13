import { ListConfig } from "./schema";

// Curated list configurations
export const LISTS: ListConfig[] = [
  {
    id: "ai-engineer-tutorials",
    name: "AI Engineer Tutorials",
    description: "Tutorials for those building with and using AI for new apps and tooling",
    username: "erinmikailstaples",
    listName: "ai-engineer-tutorials",
    repos: [
      "rungalileo/simple-agent-framework",
      "swyxio/pls-ignore-remote-mcp-server",
      "bdougie/vision",
      "sammyl720/image-generator-mcp-server",
      "TheLastBen/fast-stable-diffusion",
      "tadasant/mcp-server-stability-ai",
      "openai/codex",
      "comfyanonymous/ComfyUI",
      "codecrafters-io/build-your-own-x",
      "TecharoHQ/anubis",
      "peng-shawn/mermaid-mcp-server",
      "google/adk-python",
      "swyxio/ai-notes",
      "activepieces/activepieces",
      "niklub/rulefy",
      "langchain-ai/langgraph",
      "langchain-ai/langgraphjs",
      "erinmikailstaples/startup-sim-3000",
    ],
  },
  // Note: beginner-friendly list removed as it's currently empty on GitHub
  // Can be added back when repos are added to that list
];

// Default list ID
export const DEFAULT_LIST_ID = "ai-engineer-tutorials";

// Helper to get list by ID
export function getListById(id: string): ListConfig | undefined {
  return LISTS.find((list) => list.id === id);
}

// Helper to parse GitHub starred list URL
export function parseStarredListUrl(url: string): { username: string; listName: string } | null {
  // Format: https://github.com/stars/{username}/lists/{list-name}
  const match = url.match(/github\.com\/stars\/([^\/]+)\/lists\/([^\/\?#]+)/);
  if (match) {
    return {
      username: match[1],
      listName: match[2],
    };
  }
  return null;
}
