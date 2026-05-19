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

/** A normalized request from the model to execute a named tool. */
export interface ModelToolCall<Input = unknown> {
  id: string;
  name: string;
  input: Input;
}

/** A complete normalized tool-call request emitted by the model. */
export interface ModelToolCallEvent {
  type: "model:tool-call";
  toolCall: ModelToolCall;
}

/** Final normalized output of one model invocation. */
export interface ModelResponseEvent {
  type: "model:response";
  text?: string;
  toolCalls?: ModelToolCall[];
}

/** Token/accounting metadata for a model invocation. */
export interface ModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  source?: "provider" | "estimated";
}

/** Token/accounting metadata reported or estimated for one model invocation. */
export interface ModelUsageEvent {
  type: "model:usage";
  usage: ModelUsage;
}

/** Final non-delta events emitted by a model adapter. */
export type ModelFinalEvent =
  | ModelResponseEvent
  | ModelToolCallEvent
  | ModelUsageEvent;

export type ModelDeltaEvent = ModelTextDeltaEvent | ModelToolCallDeltaEvent;

/** All normalized events emitted by a streaming model adapter. */
export type ModelStreamEvent = ModelDeltaEvent | ModelFinalEvent;
