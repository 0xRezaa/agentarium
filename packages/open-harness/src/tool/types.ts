import { Branded } from "#core/types";

export type ToolCallId = Branded<string, "ToolCallId">;

export interface ToolExecutionContext {
  toolCallId: ToolCallId;
  agentId: string;
  runId: string;
  signal?: AbortSignal;
}

export interface Tool<Input = unknown, Result = unknown> {
  name: string;
  description: string;
  execute(input: Input, context: ToolExecutionContext): Promise<Result>;
}
