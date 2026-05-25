import type { ToolResultPart } from "./types";

export function stringifyToolResult(result: ToolResultPart["result"]): string {
  if (typeof result === "string") return result;

  try {
    return JSON.stringify(result);
  } catch {
    return String(result);
  }
}
