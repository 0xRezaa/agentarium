import type { ModelUsage } from "#core/model/usage/types";
import type { ModelToolCall } from "#core/model/tool-call/types";

/** A complete tool-call request emitted by the model. */
export interface ModelToolCallEvent {
  type: "model:tool-call";
  toolCall: ModelToolCall;
}

/** Final output of one model invocation. */
export interface ModelResponseEvent {
  type: "model:response";
  text?: string;
  toolCalls?: ModelToolCall[];
}

/** Token/accounting metadata reported or estimated for one model invocation. */
export interface ModelUsageEvent {
  type: "model:usage";
  usage: ModelUsage;
}

export type ModelFinalEvent =
  | ModelToolCallEvent
  | ModelResponseEvent
  | ModelUsageEvent;
