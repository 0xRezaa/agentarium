import {
  stringifyToolResult,
  type Message,
  type ModelRequest,
} from "@0xrezaa/core/model";
import type {
  ChatCompletionMessageParam,
  ChatCompletionRequestBase,
  ChatCompletionRequestNonStreaming,
  ChatCompletionRequestStreaming,
} from "@mlc-ai/web-llm";

function toWebLLMMessages(
  messages: readonly Message[],
): ChatCompletionMessageParam[] {
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

function toWebLLMChatRequestBase(
  request: ModelRequest,
  modelId: string,
): ChatCompletionRequestBase {
  return {
    messages: toWebLLMMessages(request.messages),
    model: modelId,
  };
}

export function toWebLLMChatRequestNonStreaming(
  request: ModelRequest,
  modelId: string,
): ChatCompletionRequestNonStreaming {
  return {
    ...toWebLLMChatRequestBase(request, modelId),
    stream: false,
  };
}

export function toWebLLMChatRequestStreaming(
  request: ModelRequest,
  modelId: string,
): ChatCompletionRequestStreaming {
  return {
    ...toWebLLMChatRequestBase(request, modelId),
    stream: true,
    stream_options: {
      include_usage: true,
    },
  };
}
