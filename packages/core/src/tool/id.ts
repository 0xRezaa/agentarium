import { Branded } from "#core/types";

export type ToolCallId = Branded<string, "ToolCallId">;

export function createToolCallId(): ToolCallId {
  return crypto.randomUUID() as ToolCallId;
}
