import type {
  TextPart,
  ToolCallPart,
  ToolResultPart,
} from "#core/model/content/types";

export type ModelMessageRole = "system" | "user" | "assistant" | "tool";

export interface SystemMessage {
  role: "system";
  content: TextPart[];
}

export interface UserMessage {
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

export interface AssistantMessage {
  role: "assistant";
  content: AssistantContent;
}

export interface ToolResultMessage {
  role: "tool";
  content: [ToolResultPart];
}

export type Message =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolResultMessage;
