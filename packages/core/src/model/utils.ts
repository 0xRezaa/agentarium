import type { ModelResponseEvent, ModelUsageEvent } from "./events/final";
import type { ModelStreamEvent } from "./events/types";
import type { ModelResponse } from "./types";

export async function collectModelResponse(
  events: AsyncIterable<ModelStreamEvent>,
): Promise<ModelResponse> {
  let responseEvent: ModelResponseEvent | undefined;
  let usageEvent: ModelUsageEvent | undefined;

  for await (const event of events) {
    if (event.type === "model:response") {
      responseEvent = event;
    } else if (event.type === "model:usage") {
      usageEvent = event;
    }
  }

  if (!responseEvent) {
    throw new Error("Model stream completed without a model:response event.");
  }

  return {
    message: {
      role: "assistant",
      parts: responseEvent.parts,
    },
    ...(usageEvent ? { usage: usageEvent.usage } : {}),
  };
}
