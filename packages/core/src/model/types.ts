import type { ModelStreamEvent } from "./events/types";
import type { AssistantModelMessage, ModelMessage } from "./messages/types";
import type { ModelUsage } from "./usage/types";

export interface ModelRequest {
  messages: ModelMessage[];
}

export interface ModelResponse {
  message: AssistantModelMessage;
  usage?: ModelUsage;
}

export interface ModelAdapter {
  id: string;
  generate(request: ModelRequest): Promise<ModelResponse>;
  /**
   * Streams model events and must emit exactly one `model:response`
   * event before completing successfully.
   */
  stream(request: ModelRequest): AsyncIterable<ModelStreamEvent>;
}
