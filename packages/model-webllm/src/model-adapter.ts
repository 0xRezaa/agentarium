import type {
  ModelAdapter,
  ModelAdapterId,
  ModelRequest,
  ModelResponse,
  ModelStreamEvent,
} from "@0xrezaa/core/model";
import type { Initializable } from "@0xrezaa/core/lifecycle";
import type { WebLLMRuntime } from "./runtime";
import type { WebLLMModelMap } from "./types";

export class WebLLMAdapter<const TModels extends WebLLMModelMap<TModels>>
  implements ModelAdapter, Initializable
{
  public readonly id: ModelAdapterId;
  constructor(
    private readonly runtime: WebLLMRuntime<TModels>,
    private readonly modelKey: keyof TModels,
  ) {
    this.id = `web-llm-adapter-${String(modelKey)}` as ModelAdapterId;
  }
  async ensureInitialized(): Promise<void> {
    await this.runtime.loadModel(this.modelKey);
  }
  async generate(request: ModelRequest): Promise<ModelResponse> {
    return this.runtime.runWithModel(this.modelKey, async (engine, modelId) => {
      // TODO: convert request into ChatCompletionRequestNonStreaming
      // engine.chat.completions.create(request);
      return {} as ModelResponse; // Placeholder until the actual implementation is done
    });
  }
  async *stream(_request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    // Implementation for streaming responses from the WebLLM model
    throw new Error("Not implemented yet");
  }
}
