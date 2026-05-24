import type {
  ChatCompletion,
  ChatCompletionMessageToolCall,
  CompletionUsage,
} from "@mlc-ai/web-llm";
import type { ToolCallId } from "@0xrezaa/core/tool";
import { describe, expect, it } from "vitest";
import {
  fromWebLLMChatCompletion,
  selectFirstWebLLMChoiceNonStreaming,
} from "./index";

const MODEL_ID = "test-model";
const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

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
      (choices) => choices[1] ?? selectFirstWebLLMChoiceNonStreaming(choices),
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

  it("maps WebLLM finish reasons to core finish metadata", () => {
    const response = fromWebLLMChatCompletion(
      createChatCompletion([
        createChoice("Partial answer.", { finishReason: "length" }),
      ]),
    );

    expect(response.finish).toEqual({
      reason: "incomplete",
      rawReason: "length",
    });
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
    finishReason?: ChatCompletion.Choice["finish_reason"];
    index?: number;
    toolCalls?: ChatCompletionMessageToolCall[];
  } = {},
): ChatCompletion.Choice {
  return {
    finish_reason: options.finishReason ?? "stop",
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
