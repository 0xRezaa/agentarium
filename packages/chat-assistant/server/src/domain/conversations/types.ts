import type { Selectable } from "kysely";
import type { Conversations } from "../../db/kysely-generated.js";

export type Conversation = Selectable<Conversations>;

export interface ConversationReader {
  findById(id: string): Promise<Conversation | undefined>;
}

export interface GetConversationService {
  getConversation(id: string): Promise<Conversation | undefined>;
}
