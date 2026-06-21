import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import {
  badRequestResponse,
  internalServerErrorResponse,
} from "../../../errors/index.js";
import { createJsonOpenApiResponse } from "../../../responses.js";
import {
  conversationResponseSchema,
  createConversationBodySchema,
} from "../schemas.js";

export const createConversationOpenApiRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createConversationBodySchema,
        },
      },
    },
  },
  responses: {
    201: createJsonOpenApiResponse({
      description: "Created conversation.",
      schema: conversationResponseSchema,
    }),
    400: badRequestResponse,
    500: internalServerErrorResponse,
  },
  summary: "Create conversation",
  tags: ["Conversations"],
});

export const createConversationHandler: RouteHandler<
  typeof createConversationOpenApiRoute
> = () => {
  throw new Error("Not implemented");
};
