import type { MLCEngineConfig, MLCEngineInterface } from "@mlc-ai/web-llm";
import { describe, expect, it, vi } from "vitest";
import { WebLLMRuntime } from "./runtime";

vi.mock("@mlc-ai/web-llm", () => ({
  MLCEngine: vi.fn(),
}));

describe("WebLLMRuntime", () => {
  it("configures WebLLM with the model catalog and reloads by model key", async () => {
    const models = {
      small: {
        model: "https://example.com/small",
        model_id: "small-model",
        model_lib: "https://example.com/small.wasm",
      },
    } as const;
    let engineConfig: MLCEngineConfig | undefined;
    const reload = vi
      .fn<MLCEngineInterface["reload"]>()
      .mockResolvedValue(undefined);
    const engine = {
      reload,
      unload: vi
        .fn<MLCEngineInterface["unload"]>()
        .mockResolvedValue(undefined),
    } as unknown as MLCEngineInterface;

    const runtime = new WebLLMRuntime(
      {
        models,
        cacheBackend: "indexeddb",
        logLevel: "WARN",
      },
      (config) => {
        engineConfig = config;
        return engine;
      },
    );

    expect(engineConfig).toEqual({
      appConfig: {
        model_list: [models.small],
        cacheBackend: "indexeddb",
      },
      logLevel: "WARN",
    });

    await runtime.loadModel("small");

    expect(reload).toHaveBeenCalledWith("small-model");
  });
});
