import type { ModelStreamEvent } from "#core/model/events/types";
import type { ModelAdapterId } from "#core/model/id";
import type { ModelAdapter, ModelResponse } from "#core/model/types";
import { collectModelResponse } from "#core/model/utils";

const mockModelStreamEvents: ModelStreamEvent[] = [
  { type: "model:text-delta", delta: "Hello" },
  { type: "model:text-delta", delta: " world" },
  {
    type: "model:response",
    content: [{ type: "text", text: "Hello world" }],
    finish: { reason: "complete" },
  },
];

export class MockModelAdapter implements ModelAdapter {
  constructor(
    private readonly events: ModelStreamEvent[] = mockModelStreamEvents,
  ) {}
  id: ModelAdapterId = "mock-model-adapter" as ModelAdapterId;
  // Static test fixtures still implement the async model stream contract.
  // eslint-disable-next-line @typescript-eslint/require-await
  async *stream(): AsyncIterable<ModelStreamEvent> {
    yield* this.events;
  }
  async generate(): Promise<ModelResponse> {
    return collectModelResponse(this.stream());
  }
}
