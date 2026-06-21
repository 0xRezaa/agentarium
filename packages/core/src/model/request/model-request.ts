import type { Message } from "../messages/types.js";
import type { GenerationOptions } from "./generation-options.js";

export interface ModelRequest {
  messages: readonly Message[];
  // TODO: add model-visible tool declarations and tool choice policy.
  // TODO: add provider-neutral generation options: maxOutputTokens, temperature, topP, stopSequences, seed.
  generationOptions?: GenerationOptions;
  // TODO: consider structured output options once core has a schema abstraction.
}
