import type { ModelStreamEvent } from "./events/types";
import type { ModelFinish } from "./finish/types";
import type { ModelAdapterId } from "./id";
import type { AssistantMessage, Message } from "./messages/types";
import type { ModelUsage } from "./usage/types";

export interface ModelRequest {
  messages: Message[];
}

export interface ModelResponse {
  message: AssistantMessage;
  finish: ModelFinish;
  // TODO: add response source metadata for provider/model/adapter traceability.
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
