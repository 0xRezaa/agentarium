import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createConstraintCheckExpression } from "./utils.js";

describe("createConstraintCheckExpression", () => {
  function useSetup() {
    const db = new Kysely<unknown>({
      dialect: new PostgresDialect({
        pool: new Pool(),
      }),
    });
    return {
      async [Symbol.asyncDispose]() {
        await db.destroy();
      },
      db,
    };
  }

  it("creates a quoted check constraint for allowed values", async () => {
    await using resources = useSetup();
    const { db } = resources;

    const query = db.schema
      .createTable("messages")
      .addColumn("role", "text")
      .addCheckConstraint(
        "message_role_check",
        createConstraintCheckExpression("role", ["user", "assistant"]),
      )
      .compile();

    expect(query.sql).toBe(
      'create table "messages" ("role" text, constraint "message_role_check" check ("role" in (\'user\', \'assistant\')))',
    );
    expect(query.parameters).toEqual([]);
  });
});
