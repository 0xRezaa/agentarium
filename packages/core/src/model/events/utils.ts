import type { ToolCallId } from "../../tool/id.js";
import type { ModelFinish } from "../finish/types.js";
import type { AssistantContent } from "../messages/types.js";
import type { ModelUsage } from "../usage/types.js";
import type { ModelTextDeltaEvent, ModelToolCallDeltaEvent } from "./delta.js";
import type { ModelResponseEvent, ModelUsageEvent } from "./final.js";

export function createModelTextDeltaEvent({
  delta,
}: {
  readonly delta: string;
}): ModelTextDeltaEvent {
  return {
    type: "model:text-delta",
    delta,
  };
}

export function createModelToolCallDeltaEvent({
  toolCallId,
  toolName,
  inputDelta,
}: {
  readonly toolCallId?: ToolCallId;
  readonly toolName?: string;
  readonly inputDelta?: string;
}): ModelToolCallDeltaEvent {
  return {
    type: "model:tool-call-delta",
    ...(toolCallId !== undefined ? { toolCallId } : {}),
    ...(toolName !== undefined ? { toolName } : {}),
    ...(inputDelta !== undefined ? { inputDelta } : {}),
  };
}

export function createModelResponseEvent({
  content,
  finish,
}: {
  readonly content: AssistantContent;
  readonly finish: ModelFinish;
}): ModelResponseEvent {
  return {
    type: "model:response",
    content: [...content],
    finish,
  };
}

export function createModelUsageEvent({
  usage,
}: {
  readonly usage: ModelUsage;
}): ModelUsageEvent {
  return {
    type: "model:usage",
    usage,
  };
}
