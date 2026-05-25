import { createToolResultPart } from "../content/utils";
import type { TextPart } from "../content/types";
import type { ToolCallId } from "../../tool/id";
import type {
  AssistantContent,
  AssistantMessage,
  SystemMessage,
  ToolResultMessage,
  UserMessage,
} from "./types";

export function createSystemMessage({
  content,
}: {
  readonly content: readonly TextPart[];
}): SystemMessage {
  return {
    role: "system",
    content: [...content],
  };
}

export function createUserMessage({
  content,
}: {
  readonly content: readonly TextPart[];
}): UserMessage {
  return {
    role: "user",
    content: [...content],
  };
}

export function createAssistantMessage({
  content,
}: {
  readonly content: AssistantContent;
}): AssistantMessage {
  return {
    role: "assistant",
    content: [...content],
  };
}

export function createToolResultMessage({
  toolCallId,
  toolName,
  result,
}: {
  readonly toolCallId: ToolCallId;
  readonly toolName: string;
  readonly result: unknown;
}): ToolResultMessage {
  return {
    role: "tool",
    content: [createToolResultPart({ toolCallId, toolName, result })],
  };
}
