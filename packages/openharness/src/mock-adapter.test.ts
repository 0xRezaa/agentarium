import type { ModelRequest, ModelStreamEvent } from "@0xrezaa/core/model";
import { describe, expect, it } from "vitest";
import {
  createMockStreamEvents,
  createOpenHarnessMockAdapter,
} from "./mock-adapter";

const request: ModelRequest = {
  messages: [
    {
      role: "user",
      content: [{ type: "text", text: "Inspect the adapter." }],
    },
  ],
};

describe("OpenHarnessMockAdapter", () => {
  it("streams deterministic text events and usage", async () => {
    const adapter = createOpenHarnessMockAdapter("text");

    await expect(collectEvents(adapter.stream(request))).resolves.toEqual(
      createMockStreamEvents("text", request),
    );
  });

  it("generates the final text response from stream events", async () => {
    const adapter = createOpenHarnessMockAdapter("text");

    await expect(adapter.generate(request)).resolves.toMatchObject({
      message: {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Mock adapter received: Inspect the adapter.",
          },
        ],
      },
      finish: { reason: "complete" },
      usage: {
        source: "estimated",
      },
    });
  });

  it("covers tool-call stream events", () => {
    expect(
      createMockStreamEvents("tool-call", request).map((event) => event.type),
    ).toEqual([
      "model:text-delta",
      "model:tool-call-delta",
      "model:tool-call-delta",
      "model:tool-call-delta",
      "model:tool-call-delta",
      "model:response",
      "model:usage",
    ]);
  });
});

async function collectEvents(
  events: AsyncIterable<ModelStreamEvent>,
): Promise<ModelStreamEvent[]> {
  const collected: ModelStreamEvent[] = [];

  for await (const event of events) {
    collected.push(event);
  }

  return collected;
}
