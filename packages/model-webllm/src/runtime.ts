import { MLCEngine } from "@mlc-ai/web-llm";
import type {
  AppConfig,
  MLCEngineConfig,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";
import type { WebLLMModelMap } from "./types.js";
import { Scheduler } from "@0xrezaa/core/concurrency";
import type { Disposable } from "@0xrezaa/core/lifecycle";

export interface WebLLMRuntimeConfig<
  TModels extends WebLLMModelMap<TModels>,
> extends Omit<MLCEngineConfig, "appConfig"> {
  models: TModels;
  cacheBackend?: AppConfig["cacheBackend"];
}

export class WebLLMRuntime<
  const TModels extends WebLLMModelMap<TModels>,
> implements Disposable {
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
      return;
    }
    return this.engine.reload(this.getModelId(modelKey)).then(() => {
      this.loadedModelKey = modelKey;
    });
  }
  getModelId(modelKey: keyof TModels): string {
    return this.modelCatalog[modelKey].model_id;
  }
  runWithModel<T>(
    modelKey: keyof TModels,
    operation: (engine: MLCEngineInterface, modelId: string) => Promise<T>,
  ): Promise<T> {
    return this.scheduler.run(async () => {
      await this.loadModel(modelKey);
      return operation(this.engine, this.getModelId(modelKey));
    });
  }
  streamWithModel<T>(
    modelKey: keyof TModels,
    operation: (
      engine: MLCEngineInterface,
      modelId: string,
    ) => AsyncIterable<T>,
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
