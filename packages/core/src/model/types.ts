import { ModelMessage } from "./messages/types";

interface ModelRequest {
  messages: ModelMessage[];
}

interface ModelResult {
  message: ModelMessage;
}

export interface ModelAdapter {
  id: string;
  generate(request: ModelRequest): Promise<ModelResult>;
}
