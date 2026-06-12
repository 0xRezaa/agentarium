import type { AgentId } from "../agent/id.js";
import type { AgentRunId } from "../harness/id.js";
import type { ToolCallId } from "./id.js";

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
