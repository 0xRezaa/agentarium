import {
  stringifyToolResult,
  type AssistantMessage,
  type Message,
  type ModelRequest,
  type ModelResponse,
  type ModelUsage,
} from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";
import type {
  ChatCompletion,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionRequestNonStreaming,
  CompletionUsage,
} from "@mlc-ai/web-llm";

export type WebLLMChoiceSelector = (
  choices: readonly ChatCompletion.Choice[],
) => ChatCompletion.Choice;

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

export function toWebLLMChatRequestNonStreaming(
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

export function selectFirstWebLLMChoice(
  choices: readonly ChatCompletion.Choice[],
): ChatCompletion.Choice {
  // Chat completion choices are alternative completions from `n`, not parts of one response.
  const [choice] = choices;
  if (!choice) {
    throw new Error("WebLLM returned no completion choices.");
  }
  return choice;
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
  selectChoice: WebLLMChoiceSelector = selectFirstWebLLMChoice,
): ModelResponse {
  const { choices, usage } = completion;
  const choice = selectChoice(choices);
  return {
    message: fromWebLLMChatCompletionMessage(choice.message),
    ...(usage ? { usage: fromWebLLMCompletionUsage(usage) } : {}),
  };
}
