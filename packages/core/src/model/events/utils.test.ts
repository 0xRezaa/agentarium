import { describe, expect, it } from "vitest";
import type { ToolCallId } from "../../tool/id.js";
import { createTextPart } from "../content/utils.js";
import {
  createModelResponseEvent,
  createModelTextDeltaEvent,
  createModelToolCallDeltaEvent,
  createModelUsageEvent,
} from "./utils.js";

const TOOL_CALL_ID = "tool-call-1" as ToolCallId;

describe("model event factories", () => {
  it("creates text delta events", () => {
    expect(createModelTextDeltaEvent({ delta: "Hello" })).toEqual({
      type: "model:text-delta",
      delta: "Hello",
    });
  });

  it("creates tool-call delta events", () => {
    expect(
      createModelToolCallDeltaEvent({
        toolCallId: TOOL_CALL_ID,
        toolName: "readFile",
        inputDelta: '{"path":"src/index.ts"}',
      }),
    ).toEqual({
      type: "model:tool-call-delta",
      toolCallId: TOOL_CALL_ID,
      toolName: "readFile",
      inputDelta: '{"path":"src/index.ts"}',
    });
  });

  it("omits undefined tool-call delta fields", () => {
    expect(createModelToolCallDeltaEvent({ toolCallId: TOOL_CALL_ID })).toEqual(
      {
        type: "model:tool-call-delta",
        toolCallId: TOOL_CALL_ID,
      },
    );
  });

  it("creates response events", () => {
    const content = [createTextPart({ text: "Done." })];

    const event = createModelResponseEvent({
      content,
      finish: { reason: "complete" },
    });

    expect(event).toEqual({
      type: "model:response",
      content,
      finish: { reason: "complete" },
    });
    expect(event.content).not.toBe(content);
  });

  it("creates usage events", () => {
    expect(
      createModelUsageEvent({
        usage: {
          inputTokens: 1,
          outputTokens: 2,
          totalTokens: 3,
          source: "estimated",
        },
      }),
    ).toEqual({
      type: "model:usage",
      usage: {
        inputTokens: 1,
        outputTokens: 2,
        totalTokens: 3,
        source: "estimated",
      },
    });
  });
});
