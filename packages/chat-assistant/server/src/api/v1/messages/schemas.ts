import { z } from "@hono/zod-openapi";
import type { ModelMessageRole } from "@0xrezaa/core/model";
import type { Selectable } from "kysely";
import type { Messages as DbMessage } from "../../../db/kysely-generated.js";
import type { ApiShape } from "../../types.js";

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
