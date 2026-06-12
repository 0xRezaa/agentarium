import type { ToolCallId } from "../../tool/id.js";
import type { TextPart, ToolCallPart, ToolResultPart } from "./types.js";

export function createTextPart({ text }: { readonly text: string }): TextPart {
  return {
    type: "text",
    text,
  };
}

export function createToolCallPart({
  toolCallId,
  toolName,
  input,
}: {
  readonly toolCallId: ToolCallId;
  readonly toolName: string;
  readonly input: unknown;
}): ToolCallPart {
  return {
    type: "tool-call",
    toolCallId,
    toolName,
    input,
  };
}

export function createToolResultPart({
  toolCallId,
  toolName,
  result,
}: {
  readonly toolCallId: ToolCallId;
  readonly toolName: string;
  readonly result: unknown;
}): ToolResultPart {
  return {
    type: "tool-result",
    toolCallId,
    toolName,
    result,
  };
}

export function stringifyToolResult(result: ToolResultPart["result"]): string {
  if (typeof result === "string") return result;

  try {
    const json = JSON.stringify(result);
    return json || String(result);
  } catch {
    return String(result);
  }
}
