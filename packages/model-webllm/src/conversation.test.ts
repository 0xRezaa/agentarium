import type {
  ChatCompletion,
  ChatCompletionMessageToolCall,
  CompletionUsage,
} from "@mlc-ai/web-llm";
import type { Message } from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";
import {
  createSystemMessage,
  createToolResultMessage,
  createUserMessage,
} from "@0xrezaa/core/test-kit/model-messages";
import { describe, expect, it } from "vitest";
import {
  fromWebLLMChatCompletion,
  selectFirstWebLLMChoice,
  toWebLLMChatRequestNonStreaming,
  toWebLLMChatRequestStreaming,
} from "./conversation";

const MODEL_ID = "test-model";
const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("toWebLLMChatRequest", () => {
  it.each([
    {
      convert: toWebLLMChatRequestNonStreaming,
      stream: false,
    },
    {
      convert: toWebLLMChatRequestStreaming,
      stream: true,
    },
  ])("sets the target model id and stream", ({ convert, stream }) => {
    const request = convert({ messages: [] }, MODEL_ID);

    expect(request).toEqual({
      messages: [],
      stream,
      model: MODEL_ID,
    });
  });

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

describe("fromWebLLMChatCompletion", () => {
  it("uses the first choice by default instead of combining alternatives", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice("First answer."),
        createChoice("Second answer.", { index: 1 }),
      ]),
    );

    expect(response.message.content).toEqual([
      { type: "text", text: "First answer." },
    ]);
  });

  it("allows callers to provide a choice selection strategy", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice("First answer."),
        createChoice("Second answer.", { index: 1 }),
      ]),
      (choices) => choices[1] ?? selectFirstWebLLMChoice(choices),
    );

    expect(response.message.content).toEqual([
      { type: "text", text: "Second answer." },
    ]);
  });

  it("throws when WebLLM returns no choices", () => {
    expect(() => fromWebLLMChatCompletion(createChatCompletion([]))).toThrow(
      "WebLLM returned no completion choices.",
    );
  });

  it("maps assistant text content to a core text part", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([createChoice("Answer.")]),
    );

    expect(response.message).toEqual({
      role: "assistant",
      content: [{ type: "text", text: "Answer." }],
    });
  });

  it("maps null assistant content to an empty assistant content array", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([createChoice(null)]),
    );

    expect(response.message).toEqual({
      role: "assistant",
      content: [],
    });
  });

  it("maps WebLLM tool calls to core tool-call parts", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice("I need to inspect the file.", {
          toolCalls: [
            createToolCall(TOOL_CALL_ID, "readFile", '{"path":"src/index.ts"}'),
          ],
        }),
      ]),
    );

    expect(response.message.content).toEqual([
      { type: "text", text: "I need to inspect the file." },
      {
        type: "tool-call",
        toolCallId: TOOL_CALL_ID,
        toolName: "readFile",
        input: '{"path":"src/index.ts"}',
      },
    ]);
  });

  it("maps usage when WebLLM reports token counts", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([createChoice("Answer.")], createUsage(3, 2, 5)),
    );

    expect(response.usage).toEqual({
      inputTokens: 3,
      outputTokens: 2,
      totalTokens: 5,
      source: "provider",
    });
  });

  it("omits usage when WebLLM does not report token counts", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([createChoice("Answer.")]),
    );

    expect("usage" in response).toBe(false);
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

function createChatCompletion(
  choices: ChatCompletion.Choice[],
  usage?: CompletionUsage,
): ChatCompletion {
  return {
    id: "chat-completion-test",
    choices,
    model: MODEL_ID,
    object: "chat.completion",
    created: 0,
    ...(usage ? { usage } : {}),
  };
}

function createChoice(
  content: string | null,
  options: {
    index?: number;
    toolCalls?: ChatCompletionMessageToolCall[];
  } = {},
): ChatCompletion.Choice {
  return {
    finish_reason: "stop",
    index: options.index ?? 0,
    logprobs: null,
    message: {
      role: "assistant",
      content,
      ...(options.toolCalls ? { tool_calls: options.toolCalls } : {}),
    },
  };
}

function createToolCall(
  id: ToolCallId,
  name: string,
  args: string,
): ChatCompletionMessageToolCall {
  return {
    id,
    type: "function",
    function: {
      name,
      arguments: args,
    },
  };
}

function createUsage(
  prompt_tokens: number,
  completion_tokens: number,
  total_tokens: number,
): CompletionUsage {
  return {
    prompt_tokens,
    completion_tokens,
    total_tokens,
    extra: {
      e2e_latency_s: 1,
      prefill_tokens_per_s: 2,
      decode_tokens_per_s: 3,
      time_to_first_token_s: 4,
      time_per_output_token_s: 5,
    },
  };
}
