import type { Branded } from "../types.js";

export type AgentRunId = Branded<string, "AgentRunId">;

export function createAgentRunId(): AgentRunId {
  return crypto.randomUUID() as AgentRunId;
}
