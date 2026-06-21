import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import type { DB } from "../../db/kysely-generated.js";
import { createMigrator } from "../../db/migrator.js";
import { ConversationRepository } from "./respository.js";

const databaseTestTimeoutMs = 120_000;

describe("ConversationRepository", () => {
  it(
    "finds a conversation by id",
    async () => {
      await using setup = await useSetup();
      const testDb = setup.db;
      const repository = new ConversationRepository(testDb);
      const conversationId = "7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91";
      const rootMessageId = "a53ef4b8-b0c6-4c9d-aedc-a8f81378c6f0";
      const currentMessageId = "51c555c5-d596-4c58-9c40-91751f1e6c13";
      const createdAt = "2026-06-21T12:00:00.000Z";
      const updatedAt = "2026-06-21T12:30:00.000Z";

      await testDb
        .insertInto("messages")
        .values([
          {
            id: rootMessageId,
            parent_message_id: null,
            role: "user",
            content: { text: "Hello" },
          },
          {
            id: currentMessageId,
            parent_message_id: rootMessageId,
            role: "assistant",
            content: { text: "Hi there" },
          },
        ])
        .execute();
      await testDb
        .insertInto("conversations")
        .values({
          id: conversationId,
          root_message_id: rootMessageId,
          current_message_id: currentMessageId,
          created_at: createdAt,
          updated_at: updatedAt,
        })
        .execute();

      await expect(repository.findById(conversationId)).resolves.toEqual({
        id: conversationId,
        root_message_id: rootMessageId,
        current_message_id: currentMessageId,
        created_at: new Date(createdAt),
        updated_at: new Date(updatedAt),
      });
    },
    databaseTestTimeoutMs,
  );

  it(
    "returns undefined when no conversation exists for the id",
    async () => {
      await using setup = await useSetup();
      const repository = new ConversationRepository(setup.db);

      await expect(
        repository.findById("7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91"),
      ).resolves.toBeUndefined();
    },
    databaseTestTimeoutMs,
  );
});

interface TestDatabaseSetup {
  db: Kysely<DB>;
  [Symbol.asyncDispose](): Promise<void>;
}

async function useSetup(): Promise<TestDatabaseSetup> {
  const container = await new PostgreSqlContainer("postgres:17-alpine")
    .withDatabase("chat_assistant_test")
    .withUsername("chat_assistant")
    .withPassword("chat_assistant")
    .start();

  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: container.getConnectionUri(),
        max: 1,
      }),
    }),
  });

  try {
    const { error } = await createMigrator(db).migrateToLatest();

    if (error) {
      throw new Error("Failed to migrate the test database.", {
        cause: error,
      });
    }

    return {
      db,
      async [Symbol.asyncDispose]() {
        await cleanup();
      },
    };
  } catch (error) {
    await cleanup();
    throw error;
  }

  async function cleanup() {
    await db.destroy();
    await container.stop();
  }
}
