import type { Branded } from "../types.js";

export type AgentId = Branded<string, "AgentId">;

export function createAgentId(): AgentId {
  return crypto.randomUUID() as AgentId;
}
