import type { Selectable } from "kysely";
import type { ConversationDto } from "./schemas.js";
import type { Conversations as DbConversation } from "../../../db/kysely-generated.js";

export function toConversationDto(
  conversation: Selectable<DbConversation>,
): ConversationDto {
  return {
    id: conversation.id,
    createdAt: conversation.created_at.toISOString(),
    updatedAt: conversation.updated_at.toISOString(),
    currentMessageId: conversation.current_message_id,
    rootMessageId: conversation.root_message_id,
  };
}
