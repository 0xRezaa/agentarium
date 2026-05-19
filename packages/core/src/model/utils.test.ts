import { describe, expect, it } from "vitest";
import type { ModelStreamEvent } from "#core/model/events/types";
import { collectModelResponse } from "./utils";

describe("collectModelResponse", () => {
  it("returns the final model response from a stream", async () => {
    const events: ModelStreamEvent[] = [
      { type: "model:text-delta", delta: "Hello" },
      { type: "model:text-delta", delta: " world" },
      {
        type: "model:response",
        parts: [{ type: "text", text: "Hello world" }],
      },
    ];

    const response = await collectModelResponse(toAsyncIterable(events));

    expect(response).toEqual({
      message: {
        role: "assistant",
        parts: [{ type: "text", text: "Hello world" }],
      },
    });
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
