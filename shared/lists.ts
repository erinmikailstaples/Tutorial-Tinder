import { ListConfig } from "./schema";

// Curated list configurations
export const LISTS: ListConfig[] = [
  {
    id: "ai-engineer-tutorials",
    name: "AI Engineer Tutorials",
    description: "Hands-on tutorials for building AI-powered applications. Includes agent frameworks, image generation tools, LangChain workflows, and practical guides for shipping AI features to production.",
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
  {
    id: "tutorials",
    name: "General Tutorials",
    description: "Learn by building. Master programming by recreating your favorite technologies, build language agents with LangChain, integrate with Stripe AI, and explore hands-on SDKs for modern development.",
    username: "erinmikailstaples",
    listName: "tutorials",
    repos: [
      "codecrafters-io/build-your-own-x",
      "rungalileo/sdk-examples",
      "langchain-ai/langgraph",
      "langchain-ai/langgraphjs",
      "stripe/ai",
      "erinmikailstaples/startup-sim-3000",
      "erinmikailstaples/ghost-tools",
    ],
  },
  {
    id: "mcp",
    name: "Model Context Protocol (MCP)",
    description: "Build powerful AI integrations with MCP servers and tools. From OpenAI Codex to GitHub MCP servers, Figma integrations, Google Sheets connectors, and everything you need to extend AI capabilities.",
    username: "erinmikailstaples",
    listName: "mcp",
    repos: [
      "swyxio/pls-ignore-remote-mcp-server",
      "sammyl720/image-generator-mcp-server",
      "tigranbs/mcgravity",
      "tadasant/mcp-server-stability-ai",
      "openai/codex",
      "punkpeye/awesome-mcp-servers",
      "peng-shawn/mermaid-mcp-server",
      "microsoft/playwright-mcp",
      "Nazruden/mcp-openvision",
      "tadata-org/fastapi_mcp",
      "GLips/Figma-Context-MCP",
      "block/goose-plugins",
      "isaacphi/mcp-gdrive",
      "mkummer225/google-sheets-mcp",
      "github/github-mcp-server",
      "activepieces/activepieces",
      "Kilo-Org/kilocode",
      "SureScaleAI/openai-gpt-image-mcp",
      "zuplo/mcp",
      "xing5/mcp-google-sheets",
      "modelcontextprotocol/python-sdk",
    ],
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
