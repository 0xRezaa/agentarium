import type { ModelMessageRole } from "@0xrezaa/core/model";

export const messageRoleValues = [
  "user",
  "assistant",
  "system",
] as const satisfies ModelMessageRole[];

export const messageStatusValues = [
  "pending",
  "streaming",
  "completed",
  "failed",
  "cancelled",
] as const;
