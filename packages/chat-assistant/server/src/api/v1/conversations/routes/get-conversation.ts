import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import {
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
} from "../../../errors/index.js";
import { conversationParamsSchema, conversationsSchema } from "../schemas.js";

export const getConversationOpenApiRoute = createRoute({
  method: "get",
  path: "/{conversationId}",
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

export const getConversationHandler: RouteHandler<
  typeof getConversationOpenApiRoute
> = () => {
  throw new Error("Not implemented");
};
