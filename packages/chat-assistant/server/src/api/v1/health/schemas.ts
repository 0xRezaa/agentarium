import { z } from "@hono/zod-openapi";

export const healthRouteResponseSchema = z
  .object({
    ok: z.boolean(),
    service: z.string(),
    database: z.object({
      ok: z.boolean(),
    }),
  })
  .openapi("HealthRouteResponse", {
    example: {
      ok: true,
      service: "chat-assistant-service",
      database: {
        ok: true,
      },
    },
  });
