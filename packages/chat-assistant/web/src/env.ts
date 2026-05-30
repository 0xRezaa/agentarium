import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(import.meta.env);
} catch (error) {
  console.error("Invalid environment variables for web:", error);
  throw error;
}

export { env };
