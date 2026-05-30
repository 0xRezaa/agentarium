import type {
  ModelAdapter,
  ModelAdapterId,
  ModelRequest,
  ModelResponse,
  ModelStreamEvent,
} from "@0xrezaa/core/model";
import type { Disposable, Initializable } from "@0xrezaa/core/lifecycle";
import { WebLLMRuntime, type WebLLMRuntimeConfig } from "./runtime";
import type { WebLLMModelMap } from "./types";
import {
  fromWebLLMChatCompletion,
  fromWebLLMChatCompletionIterable,
  toWebLLMChatRequestNonStreaming,
  toWebLLMChatRequestStreaming,
} from "./conversation";

export interface WebLLMAdapterConfig<
  TModels extends WebLLMModelMap<TModels>,
> extends WebLLMRuntimeConfig<TModels> {
  modelKey: keyof TModels;
}

export function createWebLLMAdapter<
  const TModels extends WebLLMModelMap<TModels>,
>(config: WebLLMAdapterConfig<TModels>): WebLLMAdapter<TModels> {
  const { modelKey, ...runtimeConfig } = config;
  const runtime = new WebLLMRuntime(runtimeConfig);
  return new WebLLMAdapter(runtime, modelKey);
}

export class WebLLMAdapter<const TModels extends WebLLMModelMap<TModels>>
  implements ModelAdapter, Initializable, Disposable
{
  public readonly id: ModelAdapterId;
  private readonly runtime: WebLLMRuntime<TModels>;
  private readonly modelKey: keyof TModels;
  constructor(runtime: WebLLMRuntime<TModels>, modelKey: keyof TModels) {
    this.runtime = runtime;
    this.modelKey = modelKey;
    this.id = `web-llm-adapter-${String(modelKey)}` as ModelAdapterId;
  }
  async ensureInitialized(): Promise<void> {
    await this.runtime.loadModel(this.modelKey);
  }
  async dispose(): Promise<void> {
    await this.runtime.dispose();
  }
  async generate(request: ModelRequest): Promise<ModelResponse> {
    return this.runtime.runWithModel(this.modelKey, async (engine, modelId) => {
      const webLLMRequest = toWebLLMChatRequestNonStreaming(request, modelId);
      const chatCompletion =
        await engine.chat.completions.create(webLLMRequest);
      return fromWebLLMChatCompletion(chatCompletion);
    });
  }
  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    yield* this.runtime.streamWithModel(
      this.modelKey,
      async function* (engine, modelId) {
        const webLLMRequest = toWebLLMChatRequestStreaming(request, modelId);
        const chatCompletion =
          await engine.chat.completions.create(webLLMRequest);
        yield* fromWebLLMChatCompletionIterable(chatCompletion);
      },
    );
  }
}
