import {
  MLCEngine,
  type AppConfig,
  type MLCEngineConfig,
  type MLCEngineInterface,
} from "@mlc-ai/web-llm";
import type { WebLLMModelMap } from "./types";

export interface WebLLMRepoConfig<TModels extends WebLLMModelMap> extends Omit<
  MLCEngineConfig,
  "appConfig"
> {
  models: TModels;
  cacheBackend?: AppConfig["cacheBackend"];
}

export class WebLLMRepo<const TModels extends WebLLMModelMap> {
  private readonly engine: MLCEngineInterface;
  private readonly config: MLCEngineConfig;
  private readonly models: TModels;
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
    this.config = mlcConfig;
    this.models = models;
  }
}
