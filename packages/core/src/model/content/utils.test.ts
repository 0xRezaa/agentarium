import { describe, expect, it } from "vitest";
import { stringifyToolResult } from "./utils";

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
