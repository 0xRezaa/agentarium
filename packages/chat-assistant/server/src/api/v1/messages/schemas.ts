import { z } from "@hono/zod-openapi";

// TODO: anchor these schemas on the message types from the core package
export const messageRoleSchema = z.union([
  z.literal("user"),
  z.literal("assistant"),
  z.literal("system"),
]);

// TODO: anchor these schemas on the generated db types from kysely
export const messageSchema = z.object({
  id: z.uuid(),
  parentMessageId: z.uuid().nullable(),
  content: z.json(),
  role: messageRoleSchema,
  created_at: z.date(),
});

export const messagesRouteResponseSchema = z
  .object({
    ok: z.boolean(),
  })
  .openapi("MessagesRouteResponse", {
    example: {
      ok: true,
    },
  });
