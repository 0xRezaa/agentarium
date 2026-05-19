import type { ModelStreamEvent } from "#core/model/events/types";
import type { ModelAdapter, ModelResponse } from "#core/model/types";
import { collectModelResponse } from "#core/model/utils";

const mockModelStreamEvents: ModelStreamEvent[] = [
  { type: "model:text-delta", delta: "Hello" },
  { type: "model:text-delta", delta: " world" },
  {
    type: "model:response",
    parts: [{ type: "text", text: "Hello world" }],
  },
];

export class FakeModelAdapter implements ModelAdapter {
  constructor(
    private readonly events: ModelStreamEvent[] = mockModelStreamEvents,
  ) {}
  id: string = "fake-model-adapter";
  async *stream(): AsyncIterable<ModelStreamEvent> {
    yield* this.events;
  }
  async generate(): Promise<ModelResponse> {
    return collectModelResponse(this.stream());
  }
}
