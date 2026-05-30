import {
  collectModelResponse,
  createModelResponseEvent,
  createModelTextDeltaEvent,
  createModelToolCallDeltaEvent,
  createModelUsageEvent,
  createTextPart,
  createToolCallPart,
  type ModelAdapter,
  type ModelAdapterId,
  type ModelRequest,
  type ModelResponse,
  type ModelStreamEvent,
} from "@0xrezaa/core/model";
import type { ToolCallId } from "@0xrezaa/core/tool";

export type MockScenario = "text" | "tool-call";

const MOCK_TOOL_CALL_ID = "openharness-mock-tool-call-1" as ToolCallId;

export function createOpenHarnessMockAdapter(
  scenario: MockScenario,
): OpenHarnessMockAdapter {
  return new OpenHarnessMockAdapter(scenario);
}

export function createMockStreamEvents(
  scenario: MockScenario,
  request: ModelRequest,
): ModelStreamEvent[] {
  return scenario === "tool-call"
    ? createToolCallEvents()
    : createTextEvents(request);
}

export class OpenHarnessMockAdapter implements ModelAdapter {
  readonly id: ModelAdapterId;
  private readonly scenario: MockScenario;

  constructor(scenario: MockScenario) {
    this.scenario = scenario;
    this.id = `openharness-mock-${scenario}` as ModelAdapterId;
  }

  stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    return streamEvents(createMockStreamEvents(this.scenario, request));
  }

  async generate(request: ModelRequest): Promise<ModelResponse> {
    return collectModelResponse(this.stream(request));
  }
}

async function* streamEvents(
  events: ModelStreamEvent[],
): AsyncIterable<ModelStreamEvent> {
  for (const event of events) {
    await Promise.resolve();
    yield event;
  }
}

function createTextEvents(request: ModelRequest): ModelStreamEvent[] {
  const userText = getLastUserText(request);
  const text = userText
    ? `Mock adapter received: ${userText}`
    : "Mock adapter received an empty request.";

  return [
    createModelTextDeltaEvent({ delta: text.slice(0, 22) }),
    createModelTextDeltaEvent({ delta: text.slice(22) }),
    createModelResponseEvent({
      content: [createTextPart({ text })],
      finish: { reason: "complete" },
    }),
    createModelUsageEvent({
      usage: {
        inputTokens: estimateTokenCount(userText),
        outputTokens: estimateTokenCount(text),
        totalTokens: estimateTokenCount(`${userText} ${text}`),
        source: "estimated",
      },
    }),
  ];
}

function createToolCallEvents(): ModelStreamEvent[] {
  const text = "Mock adapter is requesting a tool call.";

  return [
    createModelTextDeltaEvent({ delta: text }),
    createModelToolCallDeltaEvent({
      toolCallId: MOCK_TOOL_CALL_ID,
      toolName: "readFile",
    }),
    createModelToolCallDeltaEvent({
      toolCallId: MOCK_TOOL_CALL_ID,
      inputDelta: '{"path":"',
    }),
    createModelToolCallDeltaEvent({
      toolCallId: MOCK_TOOL_CALL_ID,
      inputDelta: "packages/model-webllm/src/model-adapter.ts",
    }),
    createModelToolCallDeltaEvent({
      toolCallId: MOCK_TOOL_CALL_ID,
      inputDelta: '"}',
    }),
    createModelResponseEvent({
      content: [
        createTextPart({ text }),
        createToolCallPart({
          toolCallId: MOCK_TOOL_CALL_ID,
          toolName: "readFile",
          input: { path: "packages/model-webllm/src/model-adapter.ts" },
        }),
      ],
      finish: { reason: "tool-use" },
    }),
    createModelUsageEvent({
      usage: {
        inputTokens: 12,
        outputTokens: 18,
        totalTokens: 30,
        source: "estimated",
      },
    }),
  ];
}

function getLastUserText(request: ModelRequest): string {
  for (let index = request.messages.length - 1; index >= 0; index -= 1) {
    const message = request.messages[index];
    if (message?.role === "user") {
      return message.content.map((part) => part.text).join("");
    }
  }

  return "";
}

function estimateTokenCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}
