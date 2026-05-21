import type {
  ChatCompletion,
  ChatCompletionMessageToolCall,
  CompletionUsage,
} from "@mlc-ai/web-llm";
import type { ToolCallId } from "@0xrezaa/core/tool";
import {
  createAssistantMessage,
  createSystemMessage,
  createToolResultMessage,
  createUserMessage,
} from "@0xrezaa/core/test-kit/model-messages";
import { describe, expect, it } from "vitest";
import {
  fromWebLLMChatCompletion,
  selectFirstWebLLMChoice,
  toWebLLMChatRequest,
} from "./conversation";

describe("toWebLLMChatRequest", () => {
  it("sets the target model id and disables streaming", () => {
    const request = toWebLLMChatRequest({ messages: [] }, "test-model");

    expect(request).toEqual({
      messages: [],
      stream: false,
      model: "test-model",
    });
  });

  it("preserves conversation message order", () => {
    const toolCallId = "tool-call-1" as ToolCallId;
    const request = toWebLLMChatRequest(
      {
        messages: [
          createSystemMessage("System."),
          createUserMessage("User."),
          createAssistantMessage("Assistant."),
          createToolResultMessage(toolCallId, "Tool."),
        ],
      },
      "test-model",
    );

    expect(request.messages.map((message) => message.role)).toEqual([
      "system",
      "user",
      "assistant",
      "tool",
    ]);
  });

  it("joins system and user text parts in order", () => {
    const request = toWebLLMChatRequest(
      {
        messages: [
          createSystemMessage("You are ", "brief."),
          createUserMessage("Say ", "hello."),
        ],
      },
      "test-model",
    );

    expect(request.messages).toEqual([
      { role: "system", content: "You are brief." },
      { role: "user", content: "Say hello." },
    ]);
  });

  it("maps only assistant text content for now", () => {
    const toolCallId = "tool-call-1" as ToolCallId;
    const request = toWebLLMChatRequest(
      {
        messages: [
          {
            role: "assistant",
            content: [
              { type: "text", text: "I need a tool." },
              {
                type: "tool-call",
                toolCallId,
                toolName: "readFile",
                input: { path: "src/index.ts" },
              },
            ],
          },
        ],
      },
      "test-model",
    );

    expect(request.messages).toEqual([
      { role: "assistant", content: "I need a tool." },
    ]);
  });

  it("maps an assistant message with no text content to null content", () => {
    const request = toWebLLMChatRequest(
      {
        messages: [
          {
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolCallId: "tool-call-1" as ToolCallId,
                toolName: "readFile",
                input: { path: "src/index.ts" },
              },
            ],
          },
        ],
      },
      "test-model",
    );

    expect(request.messages).toEqual([{ role: "assistant", content: null }]);
  });

  it("maps tool result messages to WebLLM tool messages", () => {
    const toolCallId = "tool-call-1" as ToolCallId;
    const request = toWebLLMChatRequest(
      {
        messages: [createToolResultMessage(toolCallId, { ok: true })],
      },
      "test-model",
    );

    expect(request.messages).toEqual([
      {
        role: "tool",
        tool_call_id: toolCallId,
        content: '{"ok":true}',
      },
    ]);
  });
});

describe("fromWebLLMChatCompletion", () => {
  it("uses the first choice by default instead of combining alternatives", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice(0, "First answer."),
        createChoice(1, "Second answer."),
      ]),
    );

    expect(response.message.content).toEqual([
      { type: "text", text: "First answer." },
    ]);
  });

  it("allows callers to provide a choice selection strategy", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice(0, "First answer."),
        createChoice(1, "Second answer."),
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
      createChatCompletion([createChoice(0, "Answer.")]),
    );

    expect(response.message).toEqual({
      role: "assistant",
      content: [{ type: "text", text: "Answer." }],
    });
  });

  it("maps null assistant content to an empty assistant content array", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([createChoice(0, null)]),
    );

    expect(response.message).toEqual({
      role: "assistant",
      content: [],
    });
  });

  it("maps WebLLM tool calls to core tool-call parts", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice(0, "I need to inspect the file.", [
          createToolCall("tool-call-1", "readFile", '{"path":"src/index.ts"}'),
        ]),
      ]),
    );

    expect(response.message.content).toEqual([
      { type: "text", text: "I need to inspect the file." },
      {
        type: "tool-call",
        toolCallId: "tool-call-1",
        toolName: "readFile",
        input: '{"path":"src/index.ts"}',
      },
    ]);
  });

  it("maps usage when WebLLM reports token counts", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([createChoice(0, "Answer.")], {
        prompt_tokens: 3,
        completion_tokens: 2,
        total_tokens: 5,
        extra: {
          e2e_latency_s: 1,
          prefill_tokens_per_s: 2,
          decode_tokens_per_s: 3,
          time_to_first_token_s: 4,
          time_per_output_token_s: 5,
        },
      }),
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
      createChatCompletion([createChoice(0, "Answer.")]),
    );

    expect("usage" in response).toBe(false);
  });
});

function createChatCompletion(
  choices: ChatCompletion.Choice[],
  usage?: CompletionUsage,
): ChatCompletion {
  return {
    id: "chatcmpl-test",
    choices,
    model: "test-model",
    object: "chat.completion",
    created: 0,
    ...(usage ? { usage } : {}),
  };
}

function createChoice(
  index: number,
  content: string | null,
  toolCalls?: Array<ChatCompletionMessageToolCall>,
): ChatCompletion.Choice {
  return {
    finish_reason: "stop",
    index,
    logprobs: null,
    message: {
      role: "assistant",
      content,
      ...(toolCalls ? { tool_calls: toolCalls } : {}),
    },
  };
}

function createToolCall(
  id: string,
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
