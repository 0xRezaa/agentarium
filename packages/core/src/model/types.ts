import { ModelMessage } from "./messages/types";

export interface ModelRequest {
  messages: ModelMessage[];
}

export interface ModelResult {
  message: ModelMessage;
}

export interface ModelAdapter {
  id: string;
  generate(request: ModelRequest): Promise<ModelResult>;
}
