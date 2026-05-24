import type { ModelStreamEvent } from "./events/types";
import type { ModelFinish } from "./finish/types";
import type { ModelAdapterId } from "./id";
import type { AssistantMessage, Message } from "./messages/types";
import type { ModelUsage } from "./usage/types";

export interface ModelRequest {
  messages: Message[];
  // TODO: add model-visible tool declarations and tool choice policy.
  // TODO: add provider-neutral generation options: maxOutputTokens, temperature, topP, stopSequences, seed.
  // TODO: consider structured output options once core has a schema abstraction.
}

export interface ModelResponse {
  message: AssistantMessage;
  finish: ModelFinish;
  // TODO: add response source metadata for provider/model/adapter traceability.
  // TODO: consider response identifiers/fingerprints for tracing and deterministic replay.
  usage?: ModelUsage;
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
