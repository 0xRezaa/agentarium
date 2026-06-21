import type { ConversationReader } from "./types.js";

export class ConversationService {
  private readonly repo: ConversationReader;
  constructor(repo: ConversationReader) {
    this.repo = repo;
  }
  getConversation(id: string) {
    return this.repo.findById(id);
  }
}
