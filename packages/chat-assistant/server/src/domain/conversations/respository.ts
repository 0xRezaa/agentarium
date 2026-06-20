import type { Kysely } from "kysely";
import type { DB } from "../../db/kysely-generated.js";

export class ConversationRepository {
  private readonly db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }
  findById(id: string) {
    return this.db
      .selectFrom("conversations")
      .selectAll()
      .where("id", "==", id)
      .executeTakeFirst();
  }
}
