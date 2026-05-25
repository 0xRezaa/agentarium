import type { ModelStreamEvent } from "#core/model/events/types";
import {
  createTextPart,
  createToolCallPart,
} from "../../src/model/content/utils";
import {
  createModelResponseEvent,
  createModelTextDeltaEvent,
  createModelToolCallDeltaEvent,
} from "../../src/model/events/utils";
import type { ToolCallId } from "#core/tool/id";
import { MockModelAdapter } from "./mock-model-adapter";

export function createMockModelAdapterWithToolCalls(): MockModelAdapter {
  return new MockModelAdapter(mockToolCallModelStreamEvents);
}

const mockToolCallModelStreamEvents: ModelStreamEvent[] = [
  createModelTextDeltaEvent({ delta: "I need to inspect the file first." }),
  createModelToolCallDeltaEvent({
    toolCallId: "tool-call-1" as ToolCallId,
    toolName: "readFile",
  }),
  createModelToolCallDeltaEvent({
    toolCallId: "tool-call-1" as ToolCallId,
    inputDelta: '{"path":"',
  }),
  createModelToolCallDeltaEvent({
    toolCallId: "tool-call-1" as ToolCallId,
    inputDelta: "src/index.ts",
  }),
  createModelToolCallDeltaEvent({
    toolCallId: "tool-call-1" as ToolCallId,
    inputDelta: '"}',
  }),
  createModelResponseEvent({
    content: [
      createTextPart({ text: "I need to inspect the file first." }),
      createToolCallPart({
        toolCallId: "tool-call-1" as ToolCallId,
        toolName: "readFile",
        input: { path: "src/index.ts" },
      }),
    ],
    finish: { reason: "tool-use" },
  }),
];
