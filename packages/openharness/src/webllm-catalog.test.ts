import type { ModelRecord } from "@0xrezaa/model-webllm";
import { describe, expect, it } from "vitest";
import { createCuratedWebLLMModelMap } from "./webllm-catalog";

const modelList = [
  createModelRecord("SmolLM2-360M-Instruct-q4f16_1-MLC", 376.06),
  createModelRecord("Llama-3.2-1B-Instruct-q4f16_1-MLC", 879.04),
  createModelRecord("SmolLM2-1.7B-Instruct-q4f16_1-MLC", 1774.19),
  createModelRecord("Phi-3.5-mini-instruct-q4f16_1-MLC-1k", 2520.07),
  createModelRecord("Uncurated-Model-1", 500),
];

describe("webllm catalog", () => {
  it("creates a model map keyed by the curated model ids", async () => {
    expect(
      await createCuratedWebLLMModelMap(() => Promise.resolve(modelList)),
    ).toEqual({
      "SmolLM2-360M-Instruct-q4f16_1-MLC": createModelRecord(
        "SmolLM2-360M-Instruct-q4f16_1-MLC",
        376.06,
      ),
      "Llama-3.2-1B-Instruct-q4f16_1-MLC": createModelRecord(
        "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        879.04,
      ),
      "SmolLM2-1.7B-Instruct-q4f16_1-MLC": createModelRecord(
        "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
        1774.19,
      ),
      "Phi-3.5-mini-instruct-q4f16_1-MLC-1k": createModelRecord(
        "Phi-3.5-mini-instruct-q4f16_1-MLC-1k",
        2520.07,
      ),
    });
  });
});

function createModelRecord(
  modelId: string,
  vramRequiredMB: number,
): ModelRecord {
  return {
    model: `https://example.com/${modelId}`,
    model_id: modelId,
    model_lib: `https://example.com/${modelId}.wasm`,
    vram_required_MB: vramRequiredMB,
    low_resource_required: true,
  };
}
