import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("messages")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("parent_message_id", "uuid", (col) =>
      col.references("messages.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("content", "jsonb", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("messages_parent_message_id_idx")
    .on("messages")
    .column("parent_message_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("messages").execute();
}
