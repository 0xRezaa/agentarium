import type {
  TextPart,
  ToolCallPart,
  ToolResultPart,
} from "#core/model/content/types";

export type ModelMessageRole = "system" | "user" | "assistant" | "tool";

export interface SystemModelMessage {
  role: "system";
  content: TextPart[];
}

export interface UserModelMessage {
  role: "user";
  content: TextPart[];
}

export type AssistantContent = Array<TextPart | ToolCallPart>;

export interface AssistantModelMessage {
  role: "assistant";
  content: AssistantContent;
}

export interface ToolModelMessage {
  role: "tool";
  content: [ToolResultPart];
}

export type ModelMessage =
  | SystemModelMessage
  | UserModelMessage
  | AssistantModelMessage
  | ToolModelMessage;
