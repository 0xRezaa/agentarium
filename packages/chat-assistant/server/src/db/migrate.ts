import type { MigrationResultSet } from "kysely/migration";
import { db } from "./database.js";
import z from "zod";
import { createMigrator } from "./migrator.js";

const migrator = createMigrator(db);

const migrateArgsSchema = z.union([z.literal("latest"), z.literal("down")]);
async function migrate(
  command: z.infer<typeof migrateArgsSchema>,
): Promise<MigrationResultSet> {
  switch (command) {
    case "latest":
      return migrator.migrateToLatest();
    case "down":
      return migrator.migrateDown();
    default:
      command satisfies never;
      throw new Error("unknown migration command");
  }
}

try {
  const command = migrateArgsSchema.parse(process.argv[2]);
  const { results, error } = await migrate(command);
  for (const migrationResult of results ?? []) {
    if (migrationResult.status === "Success") {
      console.log(`Migration "${migrationResult.migrationName}" succeeded`);
    } else if (migrationResult.status === "Error") {
      console.error(`Migration "${migrationResult.migrationName}" failed`);
    }
  }

  if (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  }
} finally {
  await db.destroy();
}
