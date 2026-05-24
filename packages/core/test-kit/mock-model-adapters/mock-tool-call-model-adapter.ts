import type { ModelStreamEvent } from "#core/model/events/types";
import type { ToolCallId } from "#core/tool/id";
import { MockModelAdapter } from "./mock-model-adapter";

export function createMockModelAdapterWithToolCalls(): MockModelAdapter {
  return new MockModelAdapter(mockToolCallModelStreamEvents);
}

const mockToolCallModelStreamEvents: ModelStreamEvent[] = [
  { type: "model:text-delta", delta: "I need to inspect the file first." },
  {
    type: "model:tool-call-delta",
    toolCallId: "tool-call-1" as ToolCallId,
    toolName: "readFile",
  },
  {
    type: "model:tool-call-delta",
    toolCallId: "tool-call-1" as ToolCallId,
    inputDelta: '{"path":"',
  },
  {
    type: "model:tool-call-delta",
    toolCallId: "tool-call-1" as ToolCallId,
    inputDelta: "src/index.ts",
  },
  {
    type: "model:tool-call-delta",
    toolCallId: "tool-call-1" as ToolCallId,
    inputDelta: '"}',
  },
  {
    type: "model:response",
    content: [
      { type: "text", text: "I need to inspect the file first." },
      {
        type: "tool-call",
        toolCallId: "tool-call-1" as ToolCallId,
        toolName: "readFile",
        input: { path: "src/index.ts" },
      },
    ],
    finish: { reason: "tool-use" },
  },
];
