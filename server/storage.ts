import { 
  type UserInteraction, 
  users, 
  type User, 
  type UpsertUser,
  githubTokens,
  type GithubToken,
  type InsertGithubToken
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for user interactions and auth
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // GitHub token operations (for per-user GitHub OAuth)
  getGithubToken(userId: string): Promise<GithubToken | undefined>;
  upsertGithubToken(token: InsertGithubToken): Promise<GithubToken>;
  deleteGithubToken(userId: string): Promise<void>;
  
  // Legacy interaction operations (kept for compatibility)
  saveInteraction(interaction: UserInteraction): Promise<void>;
  getInteractions(): Promise<UserInteraction[]>;
  clearInteractions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // GitHub token operations
  async getGithubToken(userId: string): Promise<GithubToken | undefined> {
    const [token] = await db.select().from(githubTokens).where(eq(githubTokens.userId, userId));
    return token;
  }

  async upsertGithubToken(tokenData: InsertGithubToken): Promise<GithubToken> {
    const [token] = await db
      .insert(githubTokens)
      .values({
        ...tokenData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: githubTokens.userId,
        set: {
          ...tokenData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return token;
  }

  async deleteGithubToken(userId: string): Promise<void> {
    await db.delete(githubTokens).where(eq(githubTokens.userId, userId));
  }

  // Legacy interaction operations (in-memory for now)
  private interactions: UserInteraction[] = [];

  async saveInteraction(interaction: UserInteraction): Promise<void> {
    this.interactions.push(interaction);
  }

  async getInteractions(): Promise<UserInteraction[]> {
    return this.interactions;
  }

  async clearInteractions(): Promise<void> {
    this.interactions = [];
  }
}

export const storage = new DatabaseStorage();
