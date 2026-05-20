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

/**
 * Assistant messages are completed model responses.
 *
 * They may contain text parts and tool-call parts.
 * The harness decides how and when to execute tool calls.
 */
export type AssistantContent = Array<TextPart | ToolCallPart>;

export interface AssistantModelMessage {
  role: "assistant";
  content: AssistantContent;
}

export interface ToolResultModelMessage {
  role: "tool";
  content: [ToolResultPart];
}

export type ModelMessage =
  | SystemModelMessage
  | UserModelMessage
  | AssistantModelMessage
  | ToolResultModelMessage;
