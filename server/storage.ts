import { randomUUID } from "crypto";

export interface IStorage {
  // Placeholder interface - actual data is generated on-demand
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
