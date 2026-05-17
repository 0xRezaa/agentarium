import { ToolCallId } from "../tool/types";

export interface TextPart {
  type: "text";
  text: string;
}

export interface ToolPartBase<T extends string> {
  type: T;
  toolName: string;
  toolCallId: ToolCallId;
}

export interface ToolCallPart extends ToolPartBase<"tool-call"> {
  input: unknown;
}

export interface ToolResultPart extends ToolPartBase<"tool-result"> {
  result: unknown;
}

export type ModelMessageRole = "system" | "user" | "assistant" | "tool";

export type MessagePart = TextPart | ToolCallPart | ToolResultPart;

export type ModelMessage =
  | {
      role: "system" | "user";
      parts: TextPart[];
    }
  | {
      role: "assistant";
      parts: Array<TextPart | ToolCallPart>;
    }
  | {
      role: "tool";
      parts: [ToolResultPart];
    };

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
