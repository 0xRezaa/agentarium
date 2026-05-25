import type { ModelRecord } from "@0xrezaa/model-webllm";

export const DEFAULT_WEBLLM_MODEL_ID = "SmolLM2-360M-Instruct-q4f16_1-MLC";

export const CURATED_WEBLLM_MODEL_IDS = [
  DEFAULT_WEBLLM_MODEL_ID,
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC-1k",
] as const;

function isCuratedWebLLMModelId(
  modelId: string,
): modelId is CuratedWebLLMModelId {
  return (CURATED_WEBLLM_MODEL_IDS as readonly string[]).includes(modelId);
}

export type CuratedWebLLMModelId = (typeof CURATED_WEBLLM_MODEL_IDS)[number];

function getPrebuildModelList(): Promise<ModelRecord[]> {
  return import("@0xrezaa/model-webllm").then(
    ({ prebuiltAppConfig }) => prebuiltAppConfig.model_list,
  );
}

export async function createCuratedWebLLMModelMap(
  getModelList: () => Promise<ModelRecord[]> = getPrebuildModelList,
): Promise<Record<CuratedWebLLMModelId, ModelRecord>> {
  const modelList = await getModelList();
  const map = modelList.reduce(
    (acc, record) => {
      if (isCuratedWebLLMModelId(record.model_id)) {
        acc[record.model_id] = record;
      }
      return acc;
    },
    {} as Record<CuratedWebLLMModelId, ModelRecord>,
  );
  console.log(map, modelList);
  return map;
}
