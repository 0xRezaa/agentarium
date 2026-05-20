import type {
  ModelAdapter,
  ModelAdapterId,
  ModelRequest,
  ModelResponse,
  ModelStreamEvent,
} from "@0xrezaa/core/model";
import type { Initializable } from "@0xrezaa/core/lifecycle";
import type { WebLLMRepo } from "./repo";
import type { WebLLMModelMap } from "./types";

export class WebLLMAdapter<const TModels extends WebLLMModelMap>
  implements ModelAdapter, Initializable
{
  public readonly id: ModelAdapterId;
  constructor(
    private readonly repo: WebLLMRepo<TModels>,
    private readonly modelKey: keyof TModels,
  ) {
    this.id = `web-llm-adapter-${String(modelKey)}` as ModelAdapterId;
  }
  async ensureInitialized(): Promise<void> {
    // Implementation for initializing the WebLLM adapter
  }
  async generate(request: ModelRequest): Promise<ModelResponse> {
    // Implementation for generating a response using the WebLLM model
    throw new Error("Not implemented yet");
  }
  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    // Implementation for streaming responses from the WebLLM model
    throw new Error("Not implemented yet");
  }
}
