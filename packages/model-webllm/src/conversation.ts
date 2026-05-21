import {
  stringifyToolResult,
  type Message,
  type ModelRequest,
} from "#core/model";
import type {
  ChatCompletionMessageParam,
  ChatCompletionRequestNonStreaming,
} from "@mlc-ai/web-llm";

function toWebLLMMessages(messages: Message[]): ChatCompletionMessageParam[] {
  return messages.map((message) => {
    switch (message.role) {
      case "system":
      case "user":
        return {
          role: message.role,
          content: message.content.map((part) => part.text).join(""),
        };
      case "assistant": {
        const text = message.content
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");

        return {
          role: "assistant",
          content: text || null,
        };
      }
      case "tool": {
        const [{ toolCallId, result }] = message.content;

        return {
          role: "tool",
          tool_call_id: toolCallId,
          content: stringifyToolResult(result),
        };
      }
      default:
        message satisfies never;
        throw new Error("Unsupported message role");
    }
  });
}

export function toWebLLMChatRequest(
  request: ModelRequest,
  model: string,
): ChatCompletionRequestNonStreaming {
  return {
    messages: toWebLLMMessages(request.messages),
    stream: false,
    model,
  };
}
