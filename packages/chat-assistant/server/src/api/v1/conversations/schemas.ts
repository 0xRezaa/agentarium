import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";
import type { Conversations as DbConversation } from "../../../db/kysely-generated.js";
import type { ApiShape } from "../../types.js";

export const conversationsSchema = z.object({
  id: z.uuid(),
  currentMessageId: z.uuid().nullable(),
  rootMessageId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ApiShape<Selectable<DbConversation>>>;
