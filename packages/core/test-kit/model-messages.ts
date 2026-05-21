import type {
  AssistantMessage,
  SystemMessage,
  TextPart,
  ToolResultMessage,
  UserMessage,
} from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";

export function createTextPart(text: string): TextPart {
  return {
    type: "text",
    text,
  };
}

export function createSystemMessage(...text: string[]): SystemMessage {
  return {
    role: "system",
    content: text.map(createTextPart),
  };
}

export function createUserMessage(...text: string[]): UserMessage {
  return {
    role: "user",
    content: text.map(createTextPart),
  };
}

export function createAssistantMessage(...text: string[]): AssistantMessage {
  return {
    role: "assistant",
    content: text.map(createTextPart),
  };
}

export function createToolResultMessage(
  toolCallId: ToolCallId,
  result: unknown,
  toolName = "testTool",
): ToolResultMessage {
  return {
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId,
        toolName,
        result,
      },
    ],
  };
}
