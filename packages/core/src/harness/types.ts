import { Branded } from "#core/types";
import { Agent } from "#core/agent/types";

type AgentRunId = Branded<string, "AgentRunId">;

export function createAgentRunId(): AgentRunId {
  return crypto.randomUUID() as AgentRunId;
}

// TODO: extend with FS and other context
export interface AgentContext {
  input: string;
}

export interface AgentRunResult {
  runId: AgentRunId;
  status: "complete" | "error";
  output?: string;
  error?: unknown;
}

// TODO: pass trace sink, tools, middleware. Later offload to config as well
export interface HarnessRunOptions {
  maxIterations?: number;
  signal?: AbortSignal;
}

export interface Harness {
  run(
    agent: Agent,
    context: AgentContext,
    options?: HarnessRunOptions,
  ): Promise<AgentRunResult>;
}
