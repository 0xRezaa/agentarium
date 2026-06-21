import type { Selectable } from "kysely";
import type { Messages as DbMessage } from "../../../db/kysely-generated.js";
import type { MessageDto } from "./schemas.js";
import z from "zod";
import { messageRoleSchema } from "../../../domain/messages/schemas.js";

export function toMessageDto(message: Selectable<DbMessage>): MessageDto {
  return {
    id: message.id,
    parentMessageId: message.parent_message_id,
    createdAt: message.created_at.toISOString(),
    role: messageRoleSchema.parse(message.role),
    content: z.json().parse(message.content),
  };
}
