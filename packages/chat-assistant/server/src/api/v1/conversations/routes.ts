import { createRoute } from "@hono/zod-openapi";
import {
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
} from "../../errors/index.js";
import { createApiRouter } from "../../router.js";
import { conversationParamsSchema, conversationsSchema } from "./schemas.js";

const getConversationRoute = createRoute({
  method: "get",
  path: "/conversations/{conversationId}",
  request: {
    params: conversationParamsSchema,
  },
  responses: {
    200: {
      description: "Responded with requested conversation",
      content: {
        "application/json": {
          schema: conversationsSchema,
        },
      },
    },
    400: badRequestResponse,
    404: notFoundResponse,
    500: internalServerErrorResponse,
  },
  summary: "Get conversation by id",
  tags: ["Conversations"],
});

export const conversationRoutes = createApiRouter();

conversationRoutes.openapi(getConversationRoute, () => {
  throw new Error("Not implemented");
});
