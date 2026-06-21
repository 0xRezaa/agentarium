import type { ModelMessageRole } from "@0xrezaa/core/model";
import { z } from "@hono/zod-openapi";

export const messageRoleSchema = z.union([
  z.literal("user"),
  z.literal("assistant"),
  z.literal("system"),
]) satisfies z.ZodType<ModelMessageRole>;

export const messageStatusSchema = z.union([
  z.literal("pending"),
  z.literal("streaming"),
  z.literal("completed"),
  z.literal("failed"),
  z.literal("cancelled"),
]);

export type MessageStatus = z.infer<typeof messageStatusSchema>;
