import type { MLCEngineConfig, MLCEngineInterface } from "@mlc-ai/web-llm";
import { toAsyncIterator } from "@0xrezaa/core/test-kit/utils";
import { describe, expect, it, vi } from "vitest";
import { WebLLMRuntime, type WebLLMRuntimeConfig } from "./runtime";

vi.mock("@mlc-ai/web-llm", () => ({
  MLCEngine: vi.fn(),
}));

const models = {
  small: {
    model: "https://example.com/small",
    model_id: "small-model",
    model_lib: "https://example.com/small.wasm",
  },
} as const;

function setupWebLLMRuntime(
  config: Partial<Omit<WebLLMRuntimeConfig<typeof models>, "models">> = {},
) {
  let engineConfig: MLCEngineConfig | undefined;
  const reload = vi
    .fn<MLCEngineInterface["reload"]>()
    .mockResolvedValue(undefined);
  const engine = {
    reload,
    unload: vi.fn<MLCEngineInterface["unload"]>().mockResolvedValue(undefined),
  } as unknown as MLCEngineInterface;

  const runtime = new WebLLMRuntime(
    {
      models,
      ...config,
    },
    (config) => {
      engineConfig = config;
      return engine;
    },
  );

  return { engineConfig, reload, runtime };
}

describe("WebLLMRuntime", () => {
  it("configures WebLLM with the model catalog and reloads by model key", async () => {
    const { engineConfig, reload, runtime } = setupWebLLMRuntime({
      cacheBackend: "indexeddb",
      logLevel: "WARN",
    });

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

  it("loads the model before running an operation", async () => {
    const { reload, runtime } = setupWebLLMRuntime();
    const events: string[] = [];
    reload.mockImplementation(async () => {
      events.push("load");
    });

    const result = await runtime.runWithModel("small", async () => {
      events.push("operation");
      return "result";
    });

    expect(result).toBe("result");
    expect(reload).toHaveBeenCalledWith("small-model");
    expect(events).toEqual(["load", "operation"]);
  });

  it("loads the model before starting a stream", async () => {
    const { reload, runtime } = setupWebLLMRuntime();
    const events: string[] = [];
    reload.mockImplementation(async () => {
      events.push("load");
    });

    const stream = runtime.streamWithModel("small", async function* () {
      events.push("operation");
      yield "chunk";
    });

    expect(reload).not.toHaveBeenCalled();

    await expect(toAsyncIterator(stream).next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    expect(reload).toHaveBeenCalledWith("small-model");
    expect(events).toEqual(["load", "operation"]);
  });
});
