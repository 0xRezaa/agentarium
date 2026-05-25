import type { ModelFinish } from "#core/model/finish/types";
import type { ModelUsage } from "#core/model/usage/types";
import type { AssistantContent } from "../messages/types";

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
