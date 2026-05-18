import { Agent } from "#core/agent/types";
import { AgentRunId } from "./id";

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
