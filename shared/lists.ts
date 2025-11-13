import { ListConfig } from "./schema";

// Curated list configurations
export const LISTS: ListConfig[] = [
  {
    id: "ai-engineer-tutorials",
    name: "AI Engineer Tutorials",
    description: "Hands-on tutorials for building AI-powered applications. Includes agent frameworks, LangChain workflows, AI coding assistants, and practical guides for shipping AI features to production.",
    username: "erinmikailstaples",
    listName: "ai-engineer-tutorials",
    repos: [
      "microsoft/generative-ai-for-beginners",
      "langchain-ai/langgraph",
      "langchain-ai/langgraphjs",
      "stripe/ai",
      "vercel/ai",
      "continuedev/continue",
      "heyitsnoah/claudesidian",
      "erinmikailstaples/startup-sim-3000",
      "erinmikailstaples/Agent-Adventures",
      "mozilla-ai/any-agent",
      "get-convex/chef",
      "mastra-ai/mastra",
      "langfuse/langfuse",
    ],
  },
  {
    id: "tutorials",
    name: "General Tutorials",
    description: "Learn by building. From beginner-friendly JavaScript tutorials to advanced API integration guides. Perfect for developers at any level looking to expand their skills.",
    username: "erinmikailstaples",
    listName: "tutorials",
    repos: [
      "microsoft/generative-ai-for-beginners",
      "dwyl/javascript-todo-list-tutorial",
      "IBM/ibmdotcom-tutorials",
      "langchain-ai/langgraph",
      "langchain-ai/langgraphjs",
      "stripe/ai",
      "erinmikailstaples/startup-sim-3000",
      "erinmikailstaples/ghost-tools",
      "erinmikailstaples/AstroTurf",
      "josephmisiti/awesome-machine-learning",
      "onlook-dev/onlook",
    ],
  },
  {
    id: "mcp",
    name: "Model Context Protocol (MCP)",
    description: "Build powerful AI integrations with MCP servers and tools. Google Sheets connectors, LinkedIn integrations, Guardian servers, and the official Python SDK for extending AI capabilities.",
    username: "erinmikailstaples",
    listName: "mcp",
    repos: [
      "modelcontextprotocol/python-sdk",
      "xing5/mcp-google-sheets",
      "jbenton/guardian-mcp-server",
      "useshortcut/mcp-server-shortcut",
      "stickerdaniel/linkedin-mcp-server",
      "mastra-ai/mastra",
    ],
  },
  {
    id: "reddit-cool",
    name: "Reddit's Cool GitHub Projects",
    description: "Trending repositories from r/coolgithubprojects. Fresh discoveries shared by the community, featuring innovative tools, creative experiments, and hidden gems you won't find anywhere else.",
    username: null,
    listName: "reddit-cool",
    repos: [],
  },
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
