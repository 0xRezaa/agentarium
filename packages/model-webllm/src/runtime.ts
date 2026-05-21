import {
  MLCEngine,
  type AppConfig,
  type MLCEngineConfig,
  type MLCEngineInterface,
} from "@mlc-ai/web-llm";
import type { WebLLMModelMap } from "./types";
import { Scheduler } from "@0xrezaa/core/concurrency";

export interface WebLLMRuntimeConfig<
  TModels extends WebLLMModelMap<TModels>,
> extends Omit<MLCEngineConfig, "appConfig"> {
  models: TModels;
  cacheBackend?: AppConfig["cacheBackend"];
}

type OperationWithModel<Returns, Models extends WebLLMModelMap<Models>> = (
  engine: MLCEngineInterface,
  modelId: Models[keyof Models]["model_id"],
) => Returns;

// TODO: Needs extra though. When sharing one repo between multiple adapters pointing to different models, we need to make sure the right model is loaded before each inference call. We can either enforce one adapter per repo, or implement some queuing mechanism to serialize inference calls and ensure the right model is loaded for each call.
// For simplicity, we can start with enforcing one adapter per repo, and later implement the queuing mechanism if needed.
export class WebLLMRuntime<const TModels extends WebLLMModelMap<TModels>> {
  private readonly scheduler: Scheduler = new Scheduler();
  private readonly engine: MLCEngineInterface;
  private readonly modelCatalog: TModels;
  private loadedModelKey?: keyof TModels;
  constructor(
    config: WebLLMRuntimeConfig<TModels>,
    createEngine: (config: MLCEngineConfig) => MLCEngineInterface = (
      config: MLCEngineConfig,
    ) => new MLCEngine(config),
  ) {
    const { models, cacheBackend, ...engineConfig } = config;
    const mlcConfig: MLCEngineConfig = {
      ...engineConfig,
      appConfig: {
        model_list: Object.values(models),
        ...(cacheBackend ? { cacheBackend } : {}),
      },
    };
    this.engine = createEngine(mlcConfig);
    this.modelCatalog = models;
  }
  async loadModel(modelKey: keyof TModels): Promise<void> {
    if (this.loadedModelKey === modelKey) {
      return Promise.resolve();
    }
    return this.engine.reload(this.getModelId(modelKey)).then(() => {
      this.loadedModelKey = modelKey;
    });
  }
  getModelId<K extends keyof TModels>(modelKey: K): TModels[K]["model_id"] {
    return this.modelCatalog[modelKey].model_id;
  }
  runWithModel<T>(
    modelKey: keyof TModels,
    operation: OperationWithModel<Promise<T>, TModels>,
  ): Promise<T> {
    return this.scheduler.run(async () => {
      await this.loadModel(modelKey);
      return operation(this.engine, this.getModelId(modelKey));
    });
  }
  streamWithModel<T>(
    modelKey: keyof TModels,
    operation: OperationWithModel<AsyncIterable<T>, TModels>,
  ): AsyncIterable<T> {
    const load = () => this.loadModel(modelKey);
    const engine = this.engine;
    const modelId = this.getModelId(modelKey);
    return this.scheduler.stream(async function* () {
      await load();
      yield* operation(engine, modelId);
    });
  }
  dispose(): Promise<void> {
    return this.engine.unload();
  }
}
