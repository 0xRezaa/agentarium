import {
  MLCEngine,
  type AppConfig,
  type MLCEngineConfig,
  type MLCEngineInterface,
  type ModelRecord,
} from "@mlc-ai/web-llm";

type WebLLMModelMap = Record<string, ModelRecord>;

export interface WebLLMRepoConfig<TModels extends WebLLMModelMap> extends Omit<
  MLCEngineConfig,
  "appConfig"
> {
  models: TModels;
  cacheBackend?: AppConfig["cacheBackend"];
}

type MLCEngineFactory = (config: MLCEngineConfig) => MLCEngineInterface;

export class WebLLMRepo<const TModels extends WebLLMModelMap> {
  private readonly engine: MLCEngineInterface;
  private readonly config: MLCEngineConfig;
  private readonly models: TModels;
  constructor(
    config: WebLLMRepoConfig<TModels>,
    createEngine: MLCEngineFactory = (config: MLCEngineConfig) =>
      new MLCEngine(config),
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
    this.config = mlcConfig;
    this.models = models;
  }
}
