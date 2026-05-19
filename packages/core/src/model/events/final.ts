import type { ModelUsage } from "#core/model/usage/types";
import type { AssistantContent } from "../messages/types";

/** Final output of one model invocation. */
export interface ModelResponseEvent {
  type: "model:response";
  content: AssistantContent;
}

/** Token/accounting metadata reported or estimated for one model invocation. */
export interface ModelUsageEvent {
  type: "model:usage";
  usage: ModelUsage;
}

export type ModelFinalEvent = ModelResponseEvent | ModelUsageEvent;
