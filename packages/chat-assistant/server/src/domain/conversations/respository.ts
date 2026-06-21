import type { Kysely } from "kysely";
import type { DB } from "../../db/kysely-generated.js";
import type { ConversationReader } from "./types.js";

export class ConversationRepository implements ConversationReader {
  private readonly db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }
  findById(id: string) {
    return this.db
      .selectFrom("conversations")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
}
