import { AgentId } from "#core/agent/id";
import { AgentRunId } from "#core/harness/id";
import { ToolCallId } from "./id";

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
