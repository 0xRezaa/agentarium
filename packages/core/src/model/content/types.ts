import type { ToolCallId } from "../../tool/id.js";

export interface TextPart {
  type: "text";
  text: string;
}

export interface ToolPartBase<T extends string> {
  type: T;
  toolName: string;
  toolCallId: ToolCallId;
}

export interface ToolCallPart extends ToolPartBase<"tool-call"> {
  input: unknown;
}

export interface ToolResultPart extends ToolPartBase<"tool-result"> {
  result: unknown;
}

export type ModelContentPart = TextPart | ToolCallPart | ToolResultPart;
