import type { Message } from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";
import {
  createSystemMessage,
  createToolResultMessage,
  createUserMessage,
} from "@0xrezaa/core/test-kit/model-messages";
import { describe, expect, it } from "vitest";
import {
  toWebLLMChatRequestNonStreaming,
  toWebLLMChatRequestStreaming,
} from "./index";

const MODEL_ID = "test-model";
const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("toWebLLMChatRequest", () => {
  it.each([
    {
      convert: toWebLLMChatRequestNonStreaming,
      expectedOptions: {},
      stream: false,
    },
    {
      convert: toWebLLMChatRequestStreaming,
      expectedOptions: { stream_options: { include_usage: true } },
      stream: true,
    },
  ])(
    "sets the target model id and stream",
    ({ convert, expectedOptions, stream }) => {
      const request = convert({ messages: [] }, MODEL_ID);

      expect(request).toEqual({
        messages: [],
        stream,
        model: MODEL_ID,
        ...expectedOptions,
      });
    },
  );

  it("maps supported core messages to WebLLM messages in order", () => {
    const messages = toWebLLMMessages(
      createSystemMessage("You are ", "brief."),
      createUserMessage("Say ", "hello."),
      createAssistantMessageWithToolCall("I need a tool."),
      createToolResultMessage(TOOL_CALL_ID, { ok: true }),
    );

    expect(messages).toEqual([
      { role: "system", content: "You are brief." },
      { role: "user", content: "Say hello." },
      { role: "assistant", content: "I need a tool." },
      {
        role: "tool",
        tool_call_id: TOOL_CALL_ID,
        content: '{"ok":true}',
      },
    ]);
  });

  it("maps an assistant message with no text content to null content", () => {
    const messages = toWebLLMMessages(createAssistantMessageWithToolCall());

    expect(messages).toEqual([{ role: "assistant", content: null }]);
  });
});

function toWebLLMMessages(...messages: Message[]) {
  return toWebLLMChatRequestNonStreaming({ messages }, MODEL_ID).messages;
}

function createAssistantMessageWithToolCall(text?: string): Message {
  return {
    role: "assistant",
    content: [
      ...(text ? [{ type: "text" as const, text }] : []),
      {
        type: "tool-call",
        toolCallId: TOOL_CALL_ID,
        toolName: "readFile",
        input: { path: "src/index.ts" },
      },
    ],
  };
}
