import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface ProjectSuggestion {
  projectIdeas: string[];
  firstPrompts: string[];
}

export async function generateProjectSuggestions(
  repoName: string,
  repoDescription: string | null,
  readmePreview: string
): Promise<ProjectSuggestion> {
  const prompt = `You are a helpful coding mentor analyzing a GitHub repository to help beginner developers understand what they can build with it.

Repository: ${repoName}
Description: ${repoDescription || 'No description provided'}
README Preview: ${readmePreview}

Based on this repository, provide:
1. Three concrete project ideas someone could build using this tool/framework/library
2. Three example first prompts they could use in Replit AI to get started building

Keep each idea/prompt concise (1-2 sentences max). Focus on practical, beginner-friendly projects.

Respond ONLY with valid JSON in this exact format:
{
  "projectIdeas": ["idea1", "idea2", "idea3"],
  "firstPrompts": ["prompt1", "prompt2", "prompt3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective for this use case
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    return {
      projectIdeas: parsed.projectIdeas || [],
      firstPrompts: parsed.firstPrompts || [],
    };
  } catch (error) {
    console.error("Error generating project suggestions:", error);
    // Return empty suggestions on error
    return {
      projectIdeas: [],
      firstPrompts: [],
    };
  }
}
