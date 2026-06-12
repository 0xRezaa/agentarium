import type { Agent } from "../agent/types.js";
import type { Message } from "../model/messages/types.js";
import type { TraceSink } from "../trace/types.js";
import type { AgentRunId } from "./id.js";

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

export type HarnessConfig = HarnessRunOptions;

export interface AgentRunContext<TContext = unknown> extends HarnessRunOptions {
  runId: AgentRunId;
  agent: Agent;
  input: AgentRunInput<TContext>;
  messages: Message[];
  iteration: number;
}

export interface IHarness {
  run(
    agent: Agent,
    input: AgentRunInput,
    options?: HarnessRunOptions,
  ): Promise<AgentRunResult>;
}
