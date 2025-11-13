import { type UserInteraction } from "@shared/schema";

// Storage interface for user interactions
export interface IStorage {
  saveInteraction(interaction: UserInteraction): Promise<void>;
  getInteractions(): Promise<UserInteraction[]>;
  clearInteractions(): Promise<void>;
}

export class MemStorage implements IStorage {
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

export const storage = new MemStorage();
