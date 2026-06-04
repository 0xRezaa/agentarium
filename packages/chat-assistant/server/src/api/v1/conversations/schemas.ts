import { z } from "@hono/zod-openapi";

// TODO: anchor these schemas on the generated db types from kysely
export const conversationsSchema = z.object({
  id: z.string(),
  current_message_id: z.string().nullable(),
  root_message_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});
