import type { ToolCallId } from "#core/tool/id";
import type { TextPart, ToolCallPart, ToolResultPart } from "./types";

export function createTextPart(text: string): TextPart {
  return {
    type: "text",
    text,
  };
}

export function createToolCallPart(
  toolCallId: ToolCallId,
  toolName: string,
  input: unknown,
): ToolCallPart {
  return {
    type: "tool-call",
    toolCallId,
    toolName,
    input,
  };
}

export function createToolResultPart(
  toolCallId: ToolCallId,
  toolName: string,
  result: unknown,
): ToolResultPart {
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
