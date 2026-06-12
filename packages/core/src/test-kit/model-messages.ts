import {
  type AssistantMessage,
  type SystemMessage,
  type ToolResultMessage,
  type UserMessage,
  createAssistantMessage as createCoreAssistantMessage,
  createSystemMessage as createCoreSystemMessage,
  createTextPart,
  createToolResultMessage as createCoreToolResultMessage,
  createUserMessage as createCoreUserMessage,
} from "../model/index.js";
import type { ToolCallId } from "@0xrezaa/core/tool";

export { createTextPart } from "@0xrezaa/core/model";

export function createSystemMessage(...text: string[]): SystemMessage {
  return createCoreSystemMessage({
    content: text.map((textPart) => createTextPart({ text: textPart })),
  });
}

export function createUserMessage(...text: string[]): UserMessage {
  return createCoreUserMessage({
    content: text.map((textPart) => createTextPart({ text: textPart })),
  });
}

export function createAssistantMessage(...text: string[]): AssistantMessage {
  return createCoreAssistantMessage({
    content: text.map((textPart) => createTextPart({ text: textPart })),
  });
}

export function createToolResultMessage(
  toolCallId: ToolCallId,
  result: unknown,
  toolName = "testTool",
): ToolResultMessage {
  return createCoreToolResultMessage({ toolCallId, toolName, result });
}
