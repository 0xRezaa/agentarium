import {
  MLCEngine,
  type AppConfig,
  type MLCEngineConfig,
  type MLCEngineInterface,
} from "@mlc-ai/web-llm";
import type { WebLLMModelMap } from "./types";

export interface WebLLMRepoConfig<
  TModels extends WebLLMModelMap<TModels>,
> extends Omit<MLCEngineConfig, "appConfig"> {
  models: TModels;
  cacheBackend?: AppConfig["cacheBackend"];
}

// TODO: Needs extra though. When sharing one repo between multiple adapters pointing to different models, we need to make sure the right model is loaded before each inference call. We can either enforce one adapter per repo, or implement some queuing mechanism to serialize inference calls and ensure the right model is loaded for each call.
// For simplicity, we can start with enforcing one adapter per repo, and later implement the queuing mechanism if needed.
export class WebLLMRepo<const TModels extends WebLLMModelMap<TModels>> {
  private readonly engine: MLCEngineInterface;
  private readonly models: TModels;
  private loadedModelKey?: keyof TModels;
  private loading:
    | {
        modelKey: keyof TModels;
        promise: Promise<void>;
      }
    | undefined;
  constructor(
    config: WebLLMRepoConfig<TModels>,
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
    this.models = models;
  }
  getModelId<K extends keyof TModels>(modelKey: K): TModels[K]["model_id"] {
    return this.models[modelKey].model_id;
  }
  ensureInitialized<K extends keyof TModels>(modelKey: K): Promise<void> {
    if (this.loadedModelKey === modelKey) {
      return Promise.resolve();
    }
    if (this.loading && this.loading.modelKey === modelKey) {
      return this.loading.promise;
    }
    const promise = this.engine
      .reload(this.getModelId(modelKey))
      .then(() => {
        this.loadedModelKey = modelKey;
      })
      .finally(() => {
        this.loading = undefined;
      });
    this.loading = { modelKey, promise };
    return promise;
  }
}
