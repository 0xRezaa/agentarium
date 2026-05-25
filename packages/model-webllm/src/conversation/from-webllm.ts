import type {
  AssistantMessage,
  ModelFinish,
  ModelResponse,
  ModelUsage,
} from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";
import type {
  ChatCompletion,
  ChatCompletionFinishReason,
  ChatCompletionMessage,
  CompletionUsage,
} from "@mlc-ai/web-llm";

export type WebLLMChoiceSelector = (
  choices: readonly ChatCompletion.Choice[],
) => ChatCompletion.Choice | undefined;

function fromWebLLMChatCompletionMessage(
  message: ChatCompletionMessage,
): AssistantMessage {
  const { content, tool_calls } = message;
  return {
    role: "assistant",
    content: [
      ...(content ? [{ type: "text" as const, text: content }] : []),
      ...(tool_calls ?? []).map((toolCall) => ({
        type: "tool-call" as const,
        toolCallId: toolCall.id as ToolCallId,
        toolName: toolCall.function.name,
        input: toolCall.function.arguments,
      })),
    ],
  };
}

export function selectFirstWebLLMChoiceNonStreaming(
  choices: readonly ChatCompletion.Choice[],
): ChatCompletion.Choice | undefined {
  // Chat completion choices are alternative completions from `n`, not parts of one response.
  return choices[0];
}

export function fromWebLLMCompletionUsage(usage: CompletionUsage): ModelUsage {
  return {
    // TODO: digest additional usage info
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
    source: "provider",
  };
}

export function fromWebLLMFinishReason(
  rawReason: ChatCompletionFinishReason | null | undefined,
): ModelFinish {
  if (!rawReason) return { reason: "unknown" };

  switch (rawReason) {
    case "stop":
      return { reason: "complete", rawReason };
    case "tool_calls":
      return { reason: "tool-use", rawReason };
    case "length":
      return { reason: "incomplete", rawReason };
    case "abort":
      return { reason: "cancelled", rawReason };
    default:
      rawReason satisfies never;
      return { reason: "unknown", rawReason };
  }
}

export function fromWebLLMChatCompletion(
  completion: ChatCompletion,
  selectChoice: WebLLMChoiceSelector = selectFirstWebLLMChoiceNonStreaming,
): ModelResponse {
  const { choices, usage } = completion;
  const choice = selectChoice(choices);
  if (!choice) {
    throw new Error("No completion choice was selected.");
  }
  return {
    message: fromWebLLMChatCompletionMessage(choice.message),
    finish: fromWebLLMFinishReason(choice.finish_reason),
    ...(usage ? { usage: fromWebLLMCompletionUsage(usage) } : {}),
  };
}
