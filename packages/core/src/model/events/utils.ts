import type { ToolCallId } from "#core/tool/id";
import type { ModelFinish } from "../finish/types";
import type { AssistantContent } from "../messages/types";
import type { ModelUsage } from "../usage/types";
import type { ModelTextDeltaEvent, ModelToolCallDeltaEvent } from "./delta";
import type { ModelResponseEvent, ModelUsageEvent } from "./final";

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
