import type { GenerationOptions } from "@0xrezaa/core/model";
import { z } from "@hono/zod-openapi";

type GenerationOptionsZodShape<T extends keyof GenerationOptions> =
  z.ZodObject<{
    [K in T]: z.ZodOptional<z.ZodType<GenerationOptions[K]>>;
  }>;

export const generationOptionSchema = z
  .object({
    model: z.string().optional().openapi({
      description:
        "Model identifier to use for generation. The accepted values depend on the configured model provider.",
      example: "gpt-4o",
    }),
    temperature: z.number().min(0).max(2).optional().openapi({
      description:
        "Sampling temperature. Lower values make output more focused and deterministic, while higher values make it more random.",
      example: 0.7,
      default: 1,
    }),
    maxTokens: z.number().int().positive().optional().openapi({
      description:
        "Maximum number of tokens to generate for the assistant response.",
      example: 512,
    }),
  })
  .openapi("GenerationOptions", {
    description:
      "Optional provider-neutral controls for model response generation.",
    example: {
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 512,
    },
  }) satisfies GenerationOptionsZodShape<"model" | "temperature" | "maxTokens">;
