import type { Branded } from "#core/types";

export type AgentRunId = Branded<string, "AgentRunId">;

export function createAgentRunId(): AgentRunId {
  return crypto.randomUUID() as AgentRunId;
}
