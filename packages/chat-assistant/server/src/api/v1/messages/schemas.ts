import { z } from "@hono/zod-openapi";
import type { ModelMessageRole } from "@0xrezaa/core/model";

export const messageRoleSchema = z.union([
  z.literal("user"),
  z.literal("assistant"),
  z.literal("system"),
]) satisfies z.ZodType<ModelMessageRole>;

export const messageSchema = z.object({
  id: z.uuid(),
  parentMessageId: z.uuid().nullable(),
  content: z.json(),
  role: messageRoleSchema,
  createdAt: z.date(),
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
