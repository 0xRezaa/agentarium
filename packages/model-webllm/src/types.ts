import type { ModelRecord } from "@mlc-ai/web-llm/lib/config.js";

export type WebLLMModelMap<TModels> = {
  readonly [K in keyof TModels]: ModelRecord;
};
