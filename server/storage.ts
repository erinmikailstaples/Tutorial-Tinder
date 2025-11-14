import { type UserInteraction, users, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for user interactions and auth
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
