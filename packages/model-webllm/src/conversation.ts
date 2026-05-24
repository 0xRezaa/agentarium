import type {
  ModelTextDeltaEvent,
  ModelToolCallDeltaEvent,
} from "#core/model/events/delta";
import {
  stringifyToolResult,
  type AssistantContent,
  type AssistantMessage,
  type Message,
  type ModelFinish,
  type ModelRequest,
  type ModelResponse,
  type ModelResponseStream,
  type ModelUsage,
  type ToolCallPart,
} from "@0xrezaa/core/model";
import { createToolCallId, type ToolCallId } from "@0xrezaa/core/tool";
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionFinishReason,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionRequestBase,
  ChatCompletionRequestNonStreaming,
  ChatCompletionRequestStreaming,
  CompletionUsage,
} from "@mlc-ai/web-llm";

export type WebLLMChoiceSelector = (
  choices: readonly ChatCompletion.Choice[],
) => ChatCompletion.Choice;

export type WebLLMStreamChoiceSelector = (
  choices: readonly ChatCompletionChunk.Choice[],
) => ChatCompletionChunk.Choice;

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

function selectFirstWebLLMChoice<T>(choices: readonly T[]) {
  // Chat completion choices are alternative completions from `n`, not parts of one response.
  const [choice] = choices;
  if (!choice) {
    throw new Error("WebLLM returned no completion choices.");
  }
  return choice;
}

export function selectFirstWebLLMChoiceNonStreaming(
  choices: readonly ChatCompletion.Choice[],
): ChatCompletion.Choice {
  return selectFirstWebLLMChoice(choices);
}

export function selectFirstWebLLMChoiceStreaming(
  choices: readonly ChatCompletionChunk.Choice[],
): ChatCompletionChunk.Choice {
  return selectFirstWebLLMChoice(choices);
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
  return {
    message: fromWebLLMChatCompletionMessage(choice.message),
    finish: fromWebLLMFinishReason(choice.finish_reason),
    ...(usage ? { usage: fromWebLLMCompletionUsage(usage) } : {}),
  };
}

function getWebLLMStreamingToolCallId(
  toolCall: ChatCompletionChunk.Choice.Delta.ToolCall,
): ToolCallId {
  return (toolCall.id as ToolCallId) ?? createToolCallId();
}

interface ToolCallPayload {
  toolCallId: ToolCallId;
  input: string;
  toolName?: string;
}

export async function* fromWebLLMChatCompletionIterable(
  completionIterable: AsyncIterable<ChatCompletionChunk>,
  selectChoice: WebLLMStreamChoiceSelector = selectFirstWebLLMChoiceStreaming,
): ModelResponseStream {
  let finalResponseText = "";
  let finish: ModelFinish | undefined;
  let usage: ModelUsage | undefined;
  const toolCalls = new Map<number, ToolCallPayload>();

  for await (const chunk of completionIterable) {
    if (chunk.usage) {
      if (usage) {
        throw new Error("WebLLM returned multiple usage chunks.");
      }
      usage = fromWebLLMCompletionUsage(chunk.usage);
    }

    const choice = selectChoice(chunk.choices);
    if (!choice) {
      continue;
    }

    if (choice.finish_reason) {
      const choiceFinish = fromWebLLMFinishReason(choice.finish_reason);
      if (finish) {
        throw new Error(
          "WebLLM returned multiple finish reasons for the selected choice.",
        );
      }
      finish = choiceFinish;
    }

    const { content, tool_calls } = choice.delta;
    if (content) {
      finalResponseText += content;
      yield {
        type: "model:text-delta",
        delta: content,
      } satisfies ModelTextDeltaEvent;
    }
    if (!tool_calls) continue;
    for (const toolCall of tool_calls) {
      const state: ToolCallPayload = toolCalls.get(toolCall.index) ?? {
        toolCallId: getWebLLMStreamingToolCallId(toolCall),
        input: "",
      };

      const toolName = toolCall.function?.name;
      if (toolName) {
        state.toolName = toolName;
      }

      const inputDelta = toolCall.function?.arguments;
      if (inputDelta) {
        state.input += inputDelta;
      }

      toolCalls.set(toolCall.index, state);

      yield {
        type: "model:tool-call-delta",
        toolCallId: state.toolCallId,
        ...(toolName ? { toolName } : {}),
        ...(inputDelta ? { inputDelta } : {}),
      } satisfies ModelToolCallDeltaEvent;
    }
  }

  const toolCallParts: ToolCallPart[] = Array.from(toolCalls.entries())
    .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
    .map(([, toolCall]) => {
      if (!toolCall.toolName) {
        throw new Error("WebLLM returned a tool call without a tool name.");
      }

      return {
        type: "tool-call" as const,
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        input: toolCall.input,
      };
    });

  const content: AssistantContent = [
    ...(finalResponseText
      ? [{ type: "text" as const, text: finalResponseText }]
      : []),
    ...toolCallParts,
  ];

  yield {
    type: "model:response",
    content,
    finish: finish ?? { reason: "unknown" },
  };

  if (usage) {
    yield {
      type: "model:usage",
      usage,
    };
  }
}
