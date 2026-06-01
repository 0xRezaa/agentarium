import { z } from "zod";
import { webEnvSchema } from "../env.schema";

let env: z.infer<typeof webEnvSchema>;

try {
  env = webEnvSchema.parse(import.meta.env);
} catch (error) {
  console.error("Invalid environment variables for web:", error);
  throw error;
}

export { env };
