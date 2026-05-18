import { Branded } from "#core/types";

export type AgentId = Branded<string, "AgentId">;

export function createAgentId(): AgentId {
  return crypto.randomUUID() as AgentId;
}
