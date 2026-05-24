import type { ModelResponseEvent, ModelUsageEvent } from "./events/final";
import type { ModelStreamEvent } from "./events/types";
import type { ModelResponse } from "./types";

/**
 * Extracts the single final `model:response` event from a completed model stream.
 *
 * @throws If the stream completes without exactly one `model:response` event.
 */
export async function collectModelResponse(
  events: AsyncIterable<ModelStreamEvent>,
): Promise<ModelResponse> {
  let responseEvent: ModelResponseEvent | undefined;
  let usageEvent: ModelUsageEvent | undefined;

  for await (const event of events) {
    if (event.type === "model:response") {
      if (responseEvent === undefined) {
        responseEvent = event;
      } else {
        throw new Error("Model stream emitted multiple model:response events.");
      }
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
      content: responseEvent.content,
    },
    finish: responseEvent.finish,
    ...(usageEvent ? { usage: usageEvent.usage } : {}),
  };
}
