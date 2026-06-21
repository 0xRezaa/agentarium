import type { ConversationReader, GetConversationService } from "./types.js";

export class ConversationService implements GetConversationService {
  private readonly repo: ConversationReader;
  constructor(repo: ConversationReader) {
    this.repo = repo;
  }
  getConversation(id: string) {
    return this.repo.findById(id);
  }
}
