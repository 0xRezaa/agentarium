import { describe, expect, it } from "vitest";
import type { ToolCallId } from "../../tool/id.js";
import { createTextPart, createToolCallPart } from "../content/utils.js";
import {
  createAssistantMessage,
  createSystemMessage,
  createToolResultMessage,
  createUserMessage,
} from "./utils.js";

const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("model message factories", () => {
  it("creates system messages from text parts", () => {
    const content = [createTextPart({ text: "Be concise." })];

    const message = createSystemMessage({ content });

    expect(message).toEqual({
      role: "system",
      content: [{ type: "text", text: "Be concise." }],
    });
    expect(message.content).not.toBe(content);
  });

  it("creates user messages from text parts", () => {
    const content = [
      createTextPart({ text: "Say " }),
      createTextPart({ text: "hello." }),
    ];

    const message = createUserMessage({ content });

    expect(message).toEqual({
      role: "user",
      content,
    });
    expect(message.content).not.toBe(content);
  });

  it("creates assistant messages from content parts", () => {
    expect(
      createAssistantMessage({
        content: [createTextPart({ text: "Answer." })],
      }),
    ).toEqual({
      role: "assistant",
      content: [{ type: "text", text: "Answer." }],
    });

    expect(
      createAssistantMessage({
        content: [
          createTextPart({ text: "I need a tool." }),
          createToolCallPart({
            toolCallId: TOOL_CALL_ID,
            toolName: "readFile",
            input: { path: "src/index.ts" },
          }),
        ],
      }),
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
    expect(createAssistantMessage({ content: [] })).toEqual({
      role: "assistant",
      content: [],
    });
  });

  it("creates tool result messages", () => {
    expect(
      createToolResultMessage({
        toolCallId: TOOL_CALL_ID,
        toolName: "readFile",
        result: { ok: true },
      }),
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
