import type { GenerationOptions } from "@0xrezaa/core/model";
import { z } from "@hono/zod-openapi";

type GenerationOptionsZodShape<T extends keyof GenerationOptions> =
  z.ZodObject<{
    [K in T]: z.ZodOptional<z.ZodType<GenerationOptions[K]>>;
  }>;

export const generationOptionSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().min(0).optional(),
  maxTokens: z.number().optional(),
}) satisfies GenerationOptionsZodShape<"model" | "temperature" | "maxTokens">;
