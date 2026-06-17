import {
  createModelResponseEvent,
  createModelTextDeltaEvent,
  createModelToolCallDeltaEvent,
  createModelUsageEvent,
  createTextPart,
  createToolCallPart,
  type AssistantContent,
  type ModelFinish,
  type ModelResponseStream,
  type ModelUsage,
  type ToolCallPart,
} from "@0xrezaa/core/model";
import { createToolCallId, type ToolCallId } from "@0xrezaa/core/tool";
import type { ChatCompletionChunk } from "@mlc-ai/web-llm";
import {
  fromWebLLMCompletionUsage,
  fromWebLLMFinishReason,
} from "./from-webllm.js";

export type WebLLMStreamChoiceSelector = (
  choices: readonly ChatCompletionChunk.Choice[],
) => ChatCompletionChunk.Choice | undefined;

export function selectFirstWebLLMChoiceStreaming(
  choices: readonly ChatCompletionChunk.Choice[],
): ChatCompletionChunk.Choice | undefined {
  return choices.find((choice) => choice.index === 0);
}

function getWebLLMStreamingToolCallId(
  toolCall: ChatCompletionChunk.Choice.Delta.ToolCall,
): ToolCallId {
  return (toolCall.id as ToolCallId | undefined) ?? createToolCallId();
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
  let selectedChoiceSeen = false;
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
    selectedChoiceSeen = true;

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
      yield createModelTextDeltaEvent({ delta: content });
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

      yield createModelToolCallDeltaEvent({
        toolCallId: state.toolCallId,
        ...(toolName !== undefined ? { toolName } : {}),
        ...(inputDelta !== undefined ? { inputDelta } : {}),
      });
    }
  }

  const toolCallParts: ToolCallPart[] = Array.from(toolCalls.entries())
    .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
    .map(([, toolCall]) => {
      if (!toolCall.toolName) {
        throw new Error("WebLLM returned a tool call without a tool name.");
      }

      return createToolCallPart({
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        input: toolCall.input,
      });
    });

  const content: AssistantContent = [
    ...(finalResponseText ? [createTextPart({ text: finalResponseText })] : []),
    ...toolCallParts,
  ];

  if (!selectedChoiceSeen) {
    throw new Error("No completion choice was selected.");
  }

  yield createModelResponseEvent({
    content,
    finish: finish ?? { reason: "unknown" },
  });

  if (usage) {
    yield createModelUsageEvent({
      usage,
    });
  }
}
