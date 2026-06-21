import type { ModelMessageRole } from "@0xrezaa/core/model";
import { z } from "@hono/zod-openapi";
import { messageRoleValues, messageStatusValues } from "./constants.js";

export const messageRoleSchema = z.union(
  messageRoleValues.map((x) => z.literal(x)),
) satisfies z.ZodType<ModelMessageRole>;

export const messageStatusSchema = z.union(
  messageStatusValues.map((x) => z.literal(x)),
);

export type MessageRole = z.infer<typeof messageRoleSchema>;
export type MessageStatus = z.infer<typeof messageStatusSchema>;
