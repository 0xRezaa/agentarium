import { Branded } from "#core/types";
import { Agent } from "#core/agent/types";

type AgentRunId = Branded<string, "AgentRunId">;

interface AgentInput {
  value: string;
}
// TODO: extend with FS and other context
export interface AgentContext {
  input: AgentInput;
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
    input: AgentInput,
    options?: HarnessRunOptions,
  ): Promise<AgentRunResult>;
}
