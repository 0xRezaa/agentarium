import type { ChatCompletionChunk, CompletionUsage } from "@mlc-ai/web-llm";
import type { ModelStreamEvent } from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";
import { describe, expect, it } from "vitest";
import { fromWebLLMChatCompletionIterable } from "./index";

const MODEL_ID = "test-model";
const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("fromWebLLMChatCompletionIterable", () => {
  it("streams only the choice of index=0 by default", async () => {
    const events = await collectStreamEvents(
      fromWebLLMChatCompletionIterable(
        toAsyncIterable([
          createChatCompletionChunk([
            createChunkChoice({ content: "Ignored.", index: 1 }),
            createChunkChoice({ content: "Selected.", index: 0 }),
          ]),
          createChatCompletionChunk([
            createChunkChoice({ finishReason: "stop", index: 1 }),
            createChunkChoice({ finishReason: "stop", index: 0 }),
          ]),
        ]),
      ),
    );

    expect(events).toEqual([
      { type: "model:text-delta", delta: "Selected." },
      {
        type: "model:response",
        content: [{ type: "text", text: "Selected." }],
        finish: { reason: "complete", rawReason: "stop" },
      },
    ]);
  });

  it("keeps text when the selected choice finishes with tool calls", async () => {
    const events = await collectStreamEvents(
      fromWebLLMChatCompletionIterable(
        toAsyncIterable([
          createChatCompletionChunk([
            createChunkChoice({ content: "I need to inspect the file." }),
          ]),
          createChatCompletionChunk([
            createChunkChoice({
              finishReason: "tool_calls",
              toolCalls: [
                createStreamingToolCall(
                  TOOL_CALL_ID,
                  "readFile",
                  '{"path":"src/index.ts"}',
                ),
              ],
            }),
          ]),
        ]),
      ),
    );

    expect(events).toEqual([
      {
        type: "model:text-delta",
        delta: "I need to inspect the file.",
      },
      {
        type: "model:tool-call-delta",
        toolCallId: TOOL_CALL_ID,
        toolName: "readFile",
        inputDelta: '{"path":"src/index.ts"}',
      },
      {
        type: "model:response",
        content: [
          { type: "text", text: "I need to inspect the file." },
          {
            type: "tool-call",
            toolCallId: TOOL_CALL_ID,
            toolName: "readFile",
            input: '{"path":"src/index.ts"}',
          },
        ],
        finish: { reason: "tool-use", rawReason: "tool_calls" },
      },
    ]);
  });

  it("emits usage after the final response when WebLLM reports token counts", async () => {
    const events = await collectStreamEvents(
      fromWebLLMChatCompletionIterable(
        toAsyncIterable([
          createChatCompletionChunk([
            createChunkChoice({ content: "Answer." }),
          ]),
          createChatCompletionChunk(
            [createChunkChoice({ finishReason: "stop" })],
            createUsage(3, 2, 5),
          ),
        ]),
      ),
    );

    expect(events).toEqual([
      { type: "model:text-delta", delta: "Answer." },
      {
        type: "model:response",
        content: [{ type: "text", text: "Answer." }],
        finish: { reason: "complete", rawReason: "stop" },
      },
      {
        type: "model:usage",
        usage: {
          inputTokens: 3,
          outputTokens: 2,
          totalTokens: 5,
          source: "provider",
        },
      },
    ]);
  });

  it("ignores chunks without a selected choice", async () => {
    const events = await collectStreamEvents(
      fromWebLLMChatCompletionIterable(
        toAsyncIterable([
          createChatCompletionChunk([]),
          createChatCompletionChunk([
            createChunkChoice({ content: "Answer." }),
          ]),
          createChatCompletionChunk([], createUsage(3, 2, 5)),
        ]),
      ),
    );

    expect(events).toEqual([
      { type: "model:text-delta", delta: "Answer." },
      {
        type: "model:response",
        content: [{ type: "text", text: "Answer." }],
        finish: { reason: "unknown" },
      },
      {
        type: "model:usage",
        usage: {
          inputTokens: 3,
          outputTokens: 2,
          totalTokens: 5,
          source: "provider",
        },
      },
    ]);
  });

  it("emits an empty response when the selected choice has no content", async () => {
    const events = await collectStreamEvents(
      fromWebLLMChatCompletionIterable(
        toAsyncIterable([
          createChatCompletionChunk([
            createChunkChoice({ finishReason: "stop" }),
          ]),
        ]),
      ),
    );

    expect(events).toEqual([
      {
        type: "model:response",
        content: [],
        finish: { reason: "complete", rawReason: "stop" },
      },
    ]);
  });

  it("throws when no completion choice is selected", async () => {
    await expect(
      collectStreamEvents(
        fromWebLLMChatCompletionIterable(
          toAsyncIterable([
            createChatCompletionChunk([]),
            createChatCompletionChunk([
              createChunkChoice({ content: "Ignored.", index: 1 }),
            ]),
          ]),
        ),
      ),
    ).rejects.toThrow("No completion choice was selected.");
  });
});

function createChatCompletionChunk(
  choices: ChatCompletionChunk.Choice[],
  usage?: CompletionUsage,
): ChatCompletionChunk {
  return {
    id: "chat-completion-chunk-test",
    choices,
    model: MODEL_ID,
    object: "chat.completion.chunk",
    created: 0,
    ...(usage ? { usage } : {}),
  };
}

function createChunkChoice(
  options: {
    content?: string | null;
    finishReason?: ChatCompletionChunk.Choice["finish_reason"];
    index?: number;
    toolCalls?: ChatCompletionChunk.Choice.Delta.ToolCall[];
  } = {},
): ChatCompletionChunk.Choice {
  return {
    delta: {
      ...(options.content === undefined ? {} : { content: options.content }),
      ...(options.toolCalls ? { tool_calls: options.toolCalls } : {}),
    },
    finish_reason: options.finishReason ?? null,
    index: options.index ?? 0,
  };
}

function createStreamingToolCall(
  id: ToolCallId,
  name: string,
  args: string,
): ChatCompletionChunk.Choice.Delta.ToolCall {
  return {
    id,
    index: 0,
    type: "function",
    function: {
      name,
      arguments: args,
    },
  };
}

function createUsage(
  prompt_tokens: number,
  completion_tokens: number,
  total_tokens: number,
): CompletionUsage {
  return {
    prompt_tokens,
    completion_tokens,
    total_tokens,
    extra: {
      e2e_latency_s: 1,
      prefill_tokens_per_s: 2,
      decode_tokens_per_s: 3,
      time_to_first_token_s: 4,
      time_per_output_token_s: 5,
    },
  };
}

async function collectStreamEvents(
  events: AsyncIterable<ModelStreamEvent>,
): Promise<ModelStreamEvent[]> {
  const collectedEvents: ModelStreamEvent[] = [];
  for await (const event of events) {
    collectedEvents.push(event);
  }
  return collectedEvents;
}

async function* toAsyncIterable<T>(items: T[]): AsyncIterable<T> {
  yield* await Promise.resolve(items);
}
