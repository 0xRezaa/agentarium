import type { ToolResultPart } from "./types";

export function stringifyToolResult(result: ToolResultPart["result"]): string {
  if (typeof result === "string") return result;

  try {
    const json = JSON.stringify(result);
    return json || String(result);
  } catch {
    return String(result);
  }
}
