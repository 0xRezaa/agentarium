import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../../../db/database.js";
import { healthRouteResponseSchema } from "./schemas.js";

const healthOpenApiRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      description: "Server is healthy",
      content: {
        "application/json": {
          schema: healthRouteResponseSchema,
        },
      },
    },
    503: {
      description: "Database is unavailable",
      content: {
        "application/json": {
          schema: healthRouteResponseSchema,
        },
      },
    },
  },
  summary: "Check server health",
  tags: ["Health"],
});

export const healthRoute = new OpenAPIHono();

healthRoute.openapi(healthOpenApiRoute, async (c) => {
  try {
    await db.selectNoFrom((eb) => eb.val(1).as("ok")).executeTakeFirstOrThrow();
    return c.json({
      ok: true,
      service: "chat-assistant-service",
      database: {
        ok: true,
      },
    });
  } catch {
    return c.json(
      {
        ok: false,
        service: "chat-assistant-service",
        database: {
          ok: false,
        },
      },
      503,
    );
  }
});
