import { z } from "zod";
import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

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

// AI-generated project suggestions schema
export const projectSuggestionSchema = z.object({
  projectIdeas: z.array(z.string()),
  firstPrompts: z.array(z.string()),
});

export type ProjectSuggestion = z.infer<typeof projectSuggestionSchema>;

// Preflight check schemas
export const preflightRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  fullName: z.string(), // e.g., "owner/repo"
});

export type PreflightRequest = z.infer<typeof preflightRequestSchema>;

export const preflightIssueSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
});

export type PreflightIssue = z.infer<typeof preflightIssueSchema>;

export const preflightResultSchema = z.object({
  language: z.string().nullable(),
  framework: z.string().nullable(),
  runCommand: z.string().nullable(),
  issues: z.array(preflightIssueSchema),
  confidence: z.number().min(0).max(1),
  detectedFiles: z.object({
    hasPackageJson: z.boolean().optional(),
    hasRequirementsTxt: z.boolean().optional(),
    hasPyprojectToml: z.boolean().optional(),
    hasDockerfile: z.boolean().optional(),
    hasReplitFile: z.boolean().optional(),
  }).optional(),
});

export type PreflightResult = z.infer<typeof preflightResultSchema>;

// Template generation schemas
export const templateRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  defaultBranch: z.string().optional(),
  language: z.string().nullable().optional(),
  framework: z.string().nullable().optional(),
  runCommand: z.string().nullable().optional(),
});

export type TemplateRequest = z.infer<typeof templateRequestSchema>;

export const templateResponseSchema = z.object({
  templateRepoUrl: z.string(),
  replitImportUrl: z.string(),
  templateName: z.string(),
  detectedLanguage: z.string(),
  detectedFramework: z.string().nullable(),
  runCommand: z.string(),
});

export type TemplateResponse = z.infer<typeof templateResponseSchema>;

// Replit Auth - Session storage table
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Replit Auth - User storage table
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// GitHub OAuth tokens table - stores per-user GitHub tokens
export const githubTokens = pgTable("github_tokens", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  accessToken: varchar("access_token").notNull(),
  refreshToken: varchar("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scope: varchar("scope"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type GithubToken = typeof githubTokens.$inferSelect;
export type InsertGithubToken = typeof githubTokens.$inferInsert;
