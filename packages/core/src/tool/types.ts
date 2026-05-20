import type { AgentId } from "#core/agent/id";
import type { AgentRunId } from "#core/harness/id";
import type { ToolCallId } from "./id";

export type * from "./id";

export interface ToolExecutionContext {
  toolCallId: ToolCallId;
  agentId: AgentId;
  runId: AgentRunId;
  signal?: AbortSignal;
}

export interface Tool<Input = unknown, Result = unknown> {
  name: string;
  description: string;
  execute(input: Input, context: ToolExecutionContext): Promise<Result>;
}

export type ToolSet<TName extends string = string> = Record<TName, Tool>;
