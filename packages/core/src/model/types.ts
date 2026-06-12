import type { ModelStreamEvent } from "./events/types.js";
import type { ModelFinish } from "./finish/types.js";
import type { ModelAdapterId } from "./id.js";
import type { AssistantMessage, Message } from "./messages/types.js";
import type { ModelUsage } from "./usage/types.js";

export interface ModelRequest {
  messages: readonly Message[];
  // TODO: add model-visible tool declarations and tool choice policy.
  // TODO: add provider-neutral generation options: maxOutputTokens, temperature, topP, stopSequences, seed.
  // TODO: consider structured output options once core has a schema abstraction.
}

export interface ModelResponse {
  readonly message: AssistantMessage;
  readonly finish: ModelFinish;
  // TODO: add response source metadata for provider/model/adapter traceability.
  // TODO: consider response identifiers/fingerprints for tracing and deterministic replay.
  readonly usage?: ModelUsage;
}

export type ModelResponseStream = AsyncIterable<ModelStreamEvent>;

export interface ModelAdapter {
  id: ModelAdapterId;
  generate(request: ModelRequest): Promise<ModelResponse>;
  /**
   * Streams model events and must emit exactly one `model:response`
   * event before completing successfully.
   */
  stream(request: ModelRequest): ModelResponseStream;
}
