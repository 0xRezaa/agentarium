import type { ToolCallId } from "../../tool/id.js";

/** Visible assistant text or hidden protocol text emitted incrementally by the model. */
export interface ModelTextDeltaEvent {
  readonly type: "model:text-delta";
  readonly delta: string;
}

/** Partial structured tool-call data emitted before the full tool call is complete. */
export interface ModelToolCallDeltaEvent {
  readonly type: "model:tool-call-delta";
  readonly toolCallId?: ToolCallId;
  readonly toolName?: string;
  readonly inputDelta?: string;
}

export type ModelDeltaEvent = ModelTextDeltaEvent | ModelToolCallDeltaEvent;
