import type { Agent } from "#core/agent/types";
import type { TraceSink } from "#core/trace/types";
import type { AgentRunId } from "./id";

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

// TODO: pass tools, middleware. Later offload to config as well
export interface HarnessRunOptions {
  maxIterations?: number;
  traceSink?: TraceSink;
  signal?: AbortSignal;
}

export interface Harness {
  run(
    agent: Agent,
    context: AgentContext,
    options?: HarnessRunOptions,
  ): Promise<AgentRunResult>;
}
