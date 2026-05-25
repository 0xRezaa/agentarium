import { describe, expect, it } from "vitest";
import type { ToolCallId } from "#core/tool/id";
import {
  createTextPart,
  createToolCallPart,
  createToolResultPart,
  stringifyToolResult,
} from "./utils";

const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("model content factories", () => {
  it("creates text parts", () => {
    expect(createTextPart("hello")).toEqual({
      type: "text",
      text: "hello",
    });
  });

  it("creates tool-call parts", () => {
    expect(
      createToolCallPart(TOOL_CALL_ID, "readFile", { path: "src/a.ts" }),
    ).toEqual({
      type: "tool-call",
      toolCallId: TOOL_CALL_ID,
      toolName: "readFile",
      input: { path: "src/a.ts" },
    });
  });

  it("creates tool-result parts", () => {
    expect(
      createToolResultPart(TOOL_CALL_ID, "readFile", { ok: true }),
    ).toEqual({
      type: "tool-result",
      toolCallId: TOOL_CALL_ID,
      toolName: "readFile",
      result: { ok: true },
    });
  });
});

describe("stringifyToolResult", () => {
  it("returns string results unchanged", () => {
    expect(stringifyToolResult("plain result")).toBe("plain result");
  });

  it("serializes JSON-compatible results", () => {
    expect(stringifyToolResult({ ok: true })).toBe('{"ok":true}');
  });

  it("falls back to String for values JSON cannot represent", () => {
    expect(stringifyToolResult(undefined)).toBe("undefined");
  });

  it("falls back to String for values JSON cannot serialize", () => {
    expect(stringifyToolResult(1n)).toBe("1");
  });
});
