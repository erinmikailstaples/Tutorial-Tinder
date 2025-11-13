import { z } from "zod";

// GitHub Repository Schema
export const repositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  description: z.string().nullable(),
  html_url: z.string(),
  stargazers_count: z.number(),
  language: z.string().nullable(),
  updated_at: z.string(),
  topics: z.array(z.string()).optional(),
});

export type Repository = z.infer<typeof repositorySchema>;

// User interaction tracking
export const userInteractionSchema = z.object({
  repoId: z.number(),
  action: z.enum(["saved", "skipped"]),
  timestamp: z.string(),
});

export type UserInteraction = z.infer<typeof userInteractionSchema>;

// README response schema
export const readmeSchema = z.object({
  content: z.string(),
  encoding: z.string(),
});

export type Readme = z.infer<typeof readmeSchema>;

// API response schemas
export const starredListResponseSchema = z.object({
  repositories: z.array(repositorySchema),
  total: z.number(),
});

export type StarredListResponse = z.infer<typeof starredListResponseSchema>;

// List configuration schema
export const listConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  username: z.string().nullable(),
  listName: z.string().nullable(),
  repos: z.array(z.string()).optional(), // Array of full_name strings like "owner/repo"
});

export type ListConfig = z.infer<typeof listConfigSchema>;
