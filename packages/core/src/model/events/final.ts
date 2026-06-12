import type { ModelFinish } from "../finish/types.js";
import type { ModelUsage } from "../usage/types.js";
import type { AssistantContent } from "../messages/types.js";

/** Final output of one model invocation. */
export interface ModelResponseEvent {
  readonly type: "model:response";
  readonly content: AssistantContent;
  readonly finish: ModelFinish;
}

/** Token/accounting metadata reported or estimated for one model invocation. */
export interface ModelUsageEvent {
  readonly type: "model:usage";
  readonly usage: ModelUsage;
}

export type ModelFinalEvent = ModelResponseEvent | ModelUsageEvent;
