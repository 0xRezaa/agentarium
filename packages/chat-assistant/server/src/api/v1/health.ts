import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const healthRouteResponseSchema = z
  .object({
    ok: z.boolean(),
    service: z.string(),
  })
  .openapi("HealthRouteResponse", {
    example: {
      ok: true,
      service: "chat-assistant-service",
    },
  });

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
  },
  summary: "Check server health",
  tags: ["Health"],
});

export const healthRoute = new OpenAPIHono();

healthRoute.openapi(healthOpenApiRoute, (c) => {
  return c.json({
    ok: true,
    service: "chat-assistant-service",
  });
});
