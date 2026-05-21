import type { ChatCompletion } from "@mlc-ai/web-llm";
import { describe, expect, it } from "vitest";
import {
  fromWebLLMChatCompletion,
  selectFirstWebLLMChoice,
} from "./conversation";

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
});

function createChatCompletion(
  choices: ChatCompletion.Choice[],
  usage?: ChatCompletion["usage"],
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

function createChoice(index: number, content: string): ChatCompletion.Choice {
  return {
    finish_reason: "stop",
    index,
    logprobs: null,
    message: {
      role: "assistant",
      content,
    },
  };
}
