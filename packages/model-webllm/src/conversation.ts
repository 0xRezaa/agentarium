import {
  stringifyToolResult,
  type AssistantMessage,
  type Message,
  type ModelRequest,
  type ModelResponse,
  type ModelUsage,
} from "#core/model";
import type { ToolCallId } from "#core/tool/id";
import type {
  ChatCompletion,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionRequestNonStreaming,
  CompletionUsage,
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
  modelId: string,
): ChatCompletionRequestNonStreaming {
  return {
    messages: toWebLLMMessages(request.messages),
    stream: false,
    model: modelId,
  };
}

function fromWebLLMChatCompletionMessage(
  message: ChatCompletionMessage,
): AssistantMessage {
  const { content, tool_calls } = message;
  return {
    role: "assistant",
    content: [
      ...(content ? [{ type: "text" as const, text: content }] : []),
      ...(tool_calls || []).map((toolCall) => ({
        type: "tool-call" as const,
        toolCallId: toolCall.id as ToolCallId,
        toolName: toolCall.function.name,
        input: toolCall.function.arguments,
      })),
    ],
  };
}

function fromWebLLMChoicesToAssistantMessage(
  choices: ChatCompletion.Choice[],
): AssistantMessage {
  return choices.reduce(
    (assistantMessage, { message }) => {
      assistantMessage.content.push(
        ...fromWebLLMChatCompletionMessage(message).content,
      );
      return assistantMessage;
    },
    {
      role: "assistant",
      content: [],
    } as AssistantMessage,
  );
}

function fromWebLLMCompletionUsage(usage: CompletionUsage): ModelUsage {
  return {
    // TODO: digest additional usage info
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
    source: "provider",
  };
}

export function fromWebLLMChatCompletion(
  completion: ChatCompletion,
): ModelResponse {
  const { choices, usage } = completion;
  return {
    message: fromWebLLMChoicesToAssistantMessage(choices),
    ...(usage ? { usage: fromWebLLMCompletionUsage(usage) } : {}),
  };
}
