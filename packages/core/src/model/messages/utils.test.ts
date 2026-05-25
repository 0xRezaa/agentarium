import { describe, expect, it } from "vitest";
import type { ToolCallId } from "../../tool/id";
import { createTextPart, createToolCallPart } from "../content/utils";
import {
  createAssistantMessage,
  createSystemMessage,
  createToolResultMessage,
  createUserMessage,
} from "./utils";

const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("model message factories", () => {
  it("creates system messages from text parts", () => {
    const content = [createTextPart("Be concise.")];

    const message = createSystemMessage(content);

    expect(message).toEqual({
      role: "system",
      content: [{ type: "text", text: "Be concise." }],
    });
    expect(message.content).not.toBe(content);
  });

  it("creates user messages from text parts", () => {
    const content = [createTextPart("Say "), createTextPart("hello.")];

    const message = createUserMessage(content);

    expect(message).toEqual({
      role: "user",
      content,
    });
    expect(message.content).not.toBe(content);
  });

  it("creates assistant messages from content parts", () => {
    expect(createAssistantMessage([createTextPart("Answer.")])).toEqual({
      role: "assistant",
      content: [{ type: "text", text: "Answer." }],
    });

    expect(
      createAssistantMessage([
        createTextPart("I need a tool."),
        createToolCallPart(TOOL_CALL_ID, "readFile", {
          path: "src/index.ts",
        }),
      ]),
    ).toEqual({
      role: "assistant",
      content: [
        { type: "text", text: "I need a tool." },
        {
          type: "tool-call",
          toolCallId: TOOL_CALL_ID,
          toolName: "readFile",
          input: { path: "src/index.ts" },
        },
      ],
    });
  });

  it("creates empty assistant messages", () => {
    expect(createAssistantMessage()).toEqual({
      role: "assistant",
      content: [],
    });
  });

  it("creates tool result messages", () => {
    expect(
      createToolResultMessage(TOOL_CALL_ID, "readFile", { ok: true }),
    ).toEqual({
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: TOOL_CALL_ID,
          toolName: "readFile",
          result: { ok: true },
        },
      ],
    });
  });
});
