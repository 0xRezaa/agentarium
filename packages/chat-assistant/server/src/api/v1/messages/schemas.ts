import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";
import type { Messages as DbMessage } from "../../../db/kysely-generated.js";
import type { ApiShape } from "../../types.js";
import { messageRoleSchema } from "../../../domain/messages/schemas.js";

export const messageSchema = z.object({
  id: z.uuid(),
  parentMessageId: z.uuid().nullable(),
  content: z.json(),
  role: messageRoleSchema,
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ApiShape<Selectable<DbMessage>>>;

export type MessageDto = z.infer<typeof messageSchema>;

export const messagesRouteResponseSchema = z
  .object({
    ok: z.boolean(),
  })
  .openapi("MessagesRouteResponse", {
    example: {
      ok: true,
    },
  });
