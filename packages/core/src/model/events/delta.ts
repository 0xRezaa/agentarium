/** Visible assistant text or hidden protocol text emitted incrementally by the model. */
export interface ModelTextDeltaEvent {
  type: "model:text-delta";
  text: string;
  channel: "assistant" | "protocol";
}

/** Partial structured tool-call data emitted before the full tool call is complete. */
export interface ModelToolCallDeltaEvent {
  type: "model:tool-call-delta";
  toolCallId?: string;
  name?: string;
  inputDelta?: string;
}

export type ModelDeltaEvent = ModelTextDeltaEvent | ModelToolCallDeltaEvent;
