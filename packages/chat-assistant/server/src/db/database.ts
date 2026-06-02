import { Pool, type PoolConfig } from "pg";
import { env } from "../env.js";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "./generated.js";

const dbPoolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: 10,
};
const dbPool = new Pool(dbPoolConfig);

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: dbPool,
  }),
});

export async function destroyDb(): Promise<void> {
  await db.destroy();
}
