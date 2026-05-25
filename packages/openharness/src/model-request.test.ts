import { describe, expect, it } from "vitest";
import { buildModelRequest } from "./model-request";

describe("buildModelRequest", () => {
  it("builds system and user messages from inspector fields", () => {
    expect(
      buildModelRequest({
        systemPrompt: "Be concise.",
        userPrompt: "Say hello.",
      }),
    ).toEqual({
      messages: [
        {
          role: "system",
          content: [{ type: "text", text: "Be concise." }],
        },
        {
          role: "user",
          content: [{ type: "text", text: "Say hello." }],
        },
      ],
    });
  });

  it("omits a blank system message and preserves the user prompt", () => {
    expect(
      buildModelRequest({
        systemPrompt: "  ",
        userPrompt: "  keep spacing  ",
      }),
    ).toEqual({
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: "  keep spacing  " }],
        },
      ],
    });
  });
});
