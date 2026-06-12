import type { ModelStreamEvent } from "../../model/events/types.js";
import type { ModelAdapterId } from "../../model/id.js";
import type { ModelAdapter, ModelResponse } from "../../model/types.js";
import { createTextPart } from "../../model/content/utils.js";
import {
  createModelResponseEvent,
  createModelTextDeltaEvent,
} from "../../model/events/utils.js";
import { collectModelResponse } from "../../model/utils.js";

const mockModelStreamEvents: ModelStreamEvent[] = [
  createModelTextDeltaEvent({ delta: "Hello" }),
  createModelTextDeltaEvent({ delta: " world" }),
  createModelResponseEvent({
    content: [createTextPart({ text: "Hello world" })],
    finish: { reason: "complete" },
  }),
];

export class MockModelAdapter implements ModelAdapter {
  private readonly events: ModelStreamEvent[];
  constructor(events: ModelStreamEvent[] = mockModelStreamEvents) {
    this.events = events;
  }
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
