import type {
  AssistantMessage,
  SystemMessage,
  ToolResultMessage,
  UserMessage,
} from "@0xrezaa/core/model";
import {
  createAssistantMessage as createCoreAssistantMessage,
  createSystemMessage as createCoreSystemMessage,
  createTextPart,
  createToolResultMessage as createCoreToolResultMessage,
  createUserMessage as createCoreUserMessage,
} from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";

export { createTextPart } from "@0xrezaa/core/model";

export function createSystemMessage(...text: string[]): SystemMessage {
  return createCoreSystemMessage(text.map(createTextPart));
}

export function createUserMessage(...text: string[]): UserMessage {
  return createCoreUserMessage(text.map(createTextPart));
}

export function createAssistantMessage(...text: string[]): AssistantMessage {
  return createCoreAssistantMessage(text.map(createTextPart));
}

export function createToolResultMessage(
  toolCallId: ToolCallId,
  result: unknown,
  toolName = "testTool",
): ToolResultMessage {
  return createCoreToolResultMessage(toolCallId, toolName, result);
}
