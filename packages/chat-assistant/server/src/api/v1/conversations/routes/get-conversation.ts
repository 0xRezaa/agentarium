import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import {
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
} from "../../../errors/index.js";
import { createJsonOpenApiResponse } from "../../../responses.js";
import {
  conversationParamsSchema,
  conversationResponseSchema,
} from "../schemas.js";

export const getConversationOpenApiRoute = createRoute({
  method: "get",
  path: "/{conversationId}",
  request: {
    params: conversationParamsSchema,
  },
  responses: {
    200: createJsonOpenApiResponse({
      description: "Responded with requested conversation",
      schema: conversationResponseSchema,
    }),
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
