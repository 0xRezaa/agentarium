import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("conversations")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("root_message_id", "uuid", (col) =>
      col.notNull().references("messages.id").onDelete("restrict"),
    )
    .addColumn("current_message_id", "uuid", (col) =>
      col.references("messages.id").onDelete("set null"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("conversations_root_message_id_idx")
    .on("conversations")
    .column("root_message_id")
    .execute();

  await db.schema
    .createIndex("conversations_updated_at_idx")
    .on("conversations")
    .column("updated_at")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("conversations").execute();
}
