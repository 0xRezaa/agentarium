import type { ModelStreamEvent } from "./events/types";
import type { AssistantMessage, Message } from "./messages/types";
import type { ModelUsage } from "./usage/types";

export interface ModelRequest {
  messages: Message[];
}

export interface ModelResponse {
  message: AssistantMessage;
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
