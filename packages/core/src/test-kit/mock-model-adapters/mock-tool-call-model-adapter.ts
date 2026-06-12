import type { ModelStreamEvent } from "../../model/events/types.js";
import {
  createTextPart,
  createToolCallPart,
} from "../../model/content/utils.js";
import {
  createModelResponseEvent,
  createModelTextDeltaEvent,
  createModelToolCallDeltaEvent,
} from "../../model/events/utils.js";
import type { ToolCallId } from "../../tool/id.js";
import { MockModelAdapter } from "./mock-model-adapter.js";

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
