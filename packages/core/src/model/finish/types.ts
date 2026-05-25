/**
 * Provider-neutral reason a model invocation stopped producing output.
 *
 * Keep this vocabulary behavioral: adapters can preserve provider-specific
 * stop details in `rawReason`.
 */
export type ModelFinishReason =
  /** The model completed a usable assistant turn without requesting follow-up work. */
  | "complete"
  /** The model requested one or more tool calls, so the agent loop should execute them. */
  | "tool-use"
  /** The model output was cut off and may contain partial text or partial structured data. */
  | "incomplete"
  /** The generation was stopped by the caller or user before the model finished naturally. */
  | "cancelled"
  /** The adapter could not confidently normalize the provider's stop condition. */
  | "unknown";

export interface ModelFinish {
  readonly reason: ModelFinishReason;
  readonly rawReason?: string;
}
