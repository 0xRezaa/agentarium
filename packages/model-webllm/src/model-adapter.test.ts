import type { MLCEngineConfig } from "@mlc-ai/web-llm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWebLLMAdapter, WebLLMAdapter } from "./index.js";

const webLLMMocks = vi.hoisted(() => {
  const reload = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const unload = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const engine = { reload, unload };
  const MLCEngine = vi.fn(function createMockMLCEngine(
    this: unknown,
    config: MLCEngineConfig,
  ) {
    void this;
    void config;
    return engine;
  });

  return { MLCEngine, reload, unload };
});

vi.mock("@mlc-ai/web-llm", () => ({
  MLCEngine: webLLMMocks.MLCEngine,
}));

const models = {
  small: {
    model: "https://example.com/small",
    model_id: "small-model",
    model_lib: "https://example.com/small.wasm",
  },
} as const;

describe("createWebLLMAdapter", () => {
  beforeEach(() => {
    webLLMMocks.MLCEngine.mockClear();
    webLLMMocks.reload.mockClear();
    webLLMMocks.unload.mockClear();
  });

  it("creates an adapter wired to a WebLLM runtime and model key", async () => {
    const adapter = createWebLLMAdapter({
      models,
      modelKey: "small",
      cacheBackend: "indexeddb",
      logLevel: "WARN",
    });

    expect(adapter).toBeInstanceOf(WebLLMAdapter);
    expect(adapter.id).toBe("web-llm-adapter-small");
    expect(webLLMMocks.MLCEngine).toHaveBeenCalledWith({
      appConfig: {
        model_list: [models.small],
        cacheBackend: "indexeddb",
      },
      logLevel: "WARN",
    });

    await adapter.ensureInitialized();

    expect(webLLMMocks.reload).toHaveBeenCalledWith("small-model");
  });

  it("disposes the underlying WebLLM runtime", async () => {
    const adapter = createWebLLMAdapter({
      models,
      modelKey: "small",
    });

    await adapter.dispose();

    expect(webLLMMocks.unload).toHaveBeenCalledTimes(1);
  });
});
