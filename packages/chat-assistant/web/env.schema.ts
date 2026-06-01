import { z } from "zod";

export const webEnvSchema = z.object({
  VITE_API_BASE_PATH: z.string().regex(/^\//, "Must start with a slash"),
});

export const viteConfigEnvSchema = z.object({
  API_BASE_URL: z.url(),
  WEB_PORT: z.coerce.number().int().positive().default(5173),
  VITE_API_BASE_PATH: webEnvSchema.shape.VITE_API_BASE_PATH,
});
