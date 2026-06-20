import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";
import type { Conversations as DbConversation } from "../../../db/kysely-generated.js";
import { createApiDataResponseSchema } from "../../responses.js";
import type { ApiShape } from "../../types.js";

export const conversationsSchema = z.object({
  id: z.uuid(),
  currentMessageId: z.uuid().nullable(),
  rootMessageId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ApiShape<Selectable<DbConversation>>>;

export type ConversationDto = z.infer<typeof conversationsSchema>;

export const conversationResponseSchema = createApiDataResponseSchema(
  conversationsSchema,
).openapi("ConversationResponse", {
  example: {
    data: {
      id: "7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91",
      currentMessageId: null,
      rootMessageId: "a53ef4b8-b0c6-4c9d-aedc-a8f81378c6f0",
      createdAt: "2026-06-21T12:00:00.000Z",
      updatedAt: "2026-06-21T12:00:00.000Z",
    },
  },
});

export const conversationParamsSchema = z.object({
  conversationId: z.uuid().openapi({
    param: {
      name: "conversationId",
      in: "path",
    },
    example: "7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91",
  }),
});
