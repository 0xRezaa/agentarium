import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_HOST: z.string().min(1).default("localhost"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().min(1),
});

interface Env extends z.infer<typeof envSchema> {
  DATABASE_URL: string;
}

let env: Env;

try {
  const parsedEnv = envSchema.parse(process.env);
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
  } = parsedEnv;

  const DATABASE_URL =
    `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}` +
    `@${POSTGRES_HOST}:${String(POSTGRES_PORT)}/${POSTGRES_DB}`;

  env = {
    ...parsedEnv,
    DATABASE_URL,
  };
} catch (error) {
  console.error("Invalid environment variables for server:", error);
  throw error;
}

export { env };
