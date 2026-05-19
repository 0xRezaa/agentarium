import { describe, expect, it } from "vitest";
import type { ModelStreamEvent } from "#core/model/events/types";
import { collectModelResponse } from "./utils";
import type { ToolCallId } from "#core/tool/id";
import type { ModelResponse } from "./types";

describe("collectModelResponse", () => {
  it("returns the final model response from a stream", async () => {
    const events: ModelStreamEvent[] = [
      { type: "model:text-delta", delta: "Hello" },
      { type: "model:text-delta", delta: " world" },
      {
        type: "model:response",
        content: [{ type: "text", text: "Hello world" }],
      },
    ];

    const response = await collectModelResponse(toAsyncIterable(events));

    expect(response).toEqual({
      message: {
        role: "assistant",
        content: [{ type: "text", text: "Hello world" }],
      },
    } satisfies ModelResponse);
  });

  it("collects usage emitted by the model stream", async () => {
    const events: ModelStreamEvent[] = [
      { type: "model:text-delta", delta: "Hello" },
      {
        type: "model:response",
        content: [{ type: "text", text: "Hello" }],
      },
      {
        type: "model:usage",
        usage: {
          inputTokens: 10,
          outputTokens: 2,
          totalTokens: 12,
          source: "provider",
        },
      },
    ];

    const response = await collectModelResponse(toAsyncIterable(events));

    expect(response).toEqual({
      message: {
        role: "assistant",
        content: [{ type: "text", text: "Hello" }],
      },
      usage: {
        inputTokens: 10,
        outputTokens: 2,
        totalTokens: 12,
        source: "provider",
      },
    } satisfies ModelResponse);
  });

  it("returns multiple response parts including tool calls", async () => {
    const toolCallId = "tool-call-1" as ToolCallId;
    const events: ModelStreamEvent[] = [
      {
        type: "model:response",
        content: [
          { type: "text", text: "I need to inspect the file." },
          {
            type: "tool-call",
            toolCallId,
            toolName: "readFile",
            input: { path: "src/index.ts" },
          },
        ],
      },
    ];

    const response = await collectModelResponse(toAsyncIterable(events));

    expect(response).toEqual({
      message: {
        role: "assistant",
        content: [
          { type: "text", text: "I need to inspect the file." },
          {
            type: "tool-call",
            toolCallId,
            toolName: "readFile",
            input: { path: "src/index.ts" },
          },
        ],
      },
    } satisfies ModelResponse);
  });

  it("uses model:response instead of assembling from deltas", async () => {
    const toolCallId = "tool-call-1" as ToolCallId;

    const events: ModelStreamEvent[] = [
      { type: "model:text-delta", delta: "Wrong streamed text." },
      {
        type: "model:tool-call-delta",
        toolCallId,
        toolName: "wrongTool",
      },
      {
        type: "model:tool-call-delta",
        toolCallId,
        inputDelta: '{"wrong":true}',
      },
      {
        type: "model:response",
        content: [
          { type: "text", text: "Correct final text." },
          {
            type: "tool-call",
            toolCallId,
            toolName: "readFile",
            input: { path: "src/index.ts" },
          },
        ],
      },
    ];

    const response = await collectModelResponse(toAsyncIterable(events));

    expect(response).toEqual({
      message: {
        role: "assistant",
        content: [
          { type: "text", text: "Correct final text." },
          {
            type: "tool-call",
            toolCallId,
            toolName: "readFile",
            input: { path: "src/index.ts" },
          },
        ],
      },
    } satisfies ModelResponse);
  });

  it("throws if the stream emits multiple model responses", async () => {
    const events: ModelStreamEvent[] = [
      {
        type: "model:response",
        content: [{ type: "text", text: "Draft" }],
      },
      {
        type: "model:response",
        content: [{ type: "text", text: "Final" }],
      },
    ];

    await expect(collectModelResponse(toAsyncIterable(events))).rejects.toThrow(
      "Model stream emitted multiple model:response events.",
    );
  });

  it("throws if the stream does not emit a model response", async () => {
    const events: ModelStreamEvent[] = [
      { type: "model:text-delta", delta: "Hello" },
    ];

    await expect(collectModelResponse(toAsyncIterable(events))).rejects.toThrow(
      "Model stream completed without a model:response event.",
    );
  });
});

async function* toAsyncIterable<T>(items: T[]): AsyncIterable<T> {
  yield* items;
}
