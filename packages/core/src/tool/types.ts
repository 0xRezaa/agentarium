import type { AgentId } from "#core/agent/id";
import type { AgentRunId } from "#core/harness/id";
import type { ToolCallId } from "./id";

export interface ToolExecutionContext {
  toolCallId: ToolCallId;
  agentId: AgentId;
  runId: AgentRunId;
  signal?: AbortSignal;
}

export interface Tool<Input = unknown, Result = unknown> {
  name: string;
  description: string;
  // TODO: add input schema metadata so tools can be advertised to model providers.
  execute(input: Input, context: ToolExecutionContext): Promise<Result>;
}

export type ToolSet<TName extends string = string> = Record<TName, Tool>;
