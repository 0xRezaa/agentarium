import type { ConversationRepository } from "./respository.js";

export class ConversationService {
  private readonly repo: ConversationRepository;
  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }
  getConversation(id: string) {
    return this.repo.findById(id);
  }
}
