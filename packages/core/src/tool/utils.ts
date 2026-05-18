import type { ToolSet } from "./types";

export function getToolDescriptions(toolSet: ToolSet): string[] {
  return Object.values(toolSet).map((tool) => tool.description);
}
