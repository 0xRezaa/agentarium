import type {
  TextPart,
  ToolCallPart,
  ToolResultPart,
} from "../content/types.js";

export type ModelMessageRole = "system" | "user" | "assistant" | "tool";

export interface SystemMessage {
  role: "system";
  content: readonly TextPart[];
}

export interface UserMessage {
  role: "user";
  content: readonly TextPart[];
}

/**
 * Assistant messages are completed model responses.
 *
 * They may contain text parts and tool-call parts.
 * The harness decides how and when to execute tool calls.
 */
export type AssistantContent = readonly (TextPart | ToolCallPart)[];

export interface AssistantMessage {
  role: "assistant";
  content: AssistantContent;
}

export interface ToolResultMessage {
  role: "tool";
  content: readonly [ToolResultPart];
}

export type Message =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolResultMessage;
