import { Pool, type PoolConfig } from "pg";
import { env } from "../env.js";
import { Kysely, PostgresDialect } from "kysely";

const dbPoolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: 10,
};
const dbPool = new Pool(dbPoolConfig);

export const db = new Kysely({
  dialect: new PostgresDialect({
    pool: dbPool,
  }),
});

export async function destroyDb(): Promise<void> {
  await db.destroy();
}
