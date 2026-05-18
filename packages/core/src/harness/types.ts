import type { Agent } from "#core/agent/types";
import type { TraceSink } from "#core/trace/types";
import type { AgentRunId } from "./id";

export interface AgentRunInput<TContext = unknown> {
  input: string;
  // TODO: extend with FS and other context
  context?: TContext;
}

export interface AgentRunResult {
  runId: AgentRunId;
  status: "complete" | "error";
  output?: string;
  error?: unknown;
}

// TODO: pass tools, middleware. Later offload to config as well
export interface HarnessRunOptions {
  maxIterations?: number;
  traceSink?: TraceSink;
  signal?: AbortSignal;
}

export interface Harness {
  run(
    agent: Agent,
    input: AgentRunInput,
    options?: HarnessRunOptions,
  ): Promise<AgentRunResult>;
}
