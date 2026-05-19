import type { ToolCallId } from "#core/tool/id";

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

export type ModelMessageRole = "system" | "user" | "assistant" | "tool";

export type MessagePart = TextPart | ToolCallPart | ToolResultPart;

interface SystemModelMessage {
  role: "system";
  parts: TextPart[];
}

interface UserModelMessage {
  role: "user";
  parts: TextPart[];
}

interface AssistantModelMessage {
  role: "assistant";
  parts: Array<TextPart | ToolCallPart>;
}

interface ToolModelMessage {
  role: "tool";
  parts: [ToolResultPart];
}

export type ModelMessage =
  | SystemModelMessage
  | UserModelMessage
  | AssistantModelMessage
  | ToolModelMessage;
