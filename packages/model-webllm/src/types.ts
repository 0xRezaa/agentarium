import type { ModelRecord } from "@mlc-ai/web-llm";

export type WebLLMModelMap<TModels> = {
  readonly [K in keyof TModels]: ModelRecord;
};
