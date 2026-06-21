import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import {
  internalServerErrorResponse,
  notFoundResponse,
  validationFailedResponse,
  type InternalServerErrorResponse,
  type NotFoundErrorResponse,
} from "../../../errors/index.js";
import { createJsonOpenApiResponse } from "../../../responses.js";
import {
  getConversationParamsSchema,
  conversationResponseSchema,
} from "../schemas.js";
import { toConversationDto } from "../mappers.js";
import type { GetConversationService } from "../../../../domain/conversations/types.js";

export const getConversationOpenApiRoute = createRoute({
  method: "get",
  path: "/{conversationId}",
  request: {
    params: getConversationParamsSchema,
  },
  responses: {
    200: createJsonOpenApiResponse({
      description: "Responded with requested conversation",
      schema: conversationResponseSchema,
    }),
    400: validationFailedResponse,
    404: notFoundResponse,
    500: internalServerErrorResponse,
  },
  summary: "Get conversation by id",
  tags: ["Conversations"],
});

export function createGetConversationHandler(
  service: GetConversationService,
): RouteHandler<typeof getConversationOpenApiRoute> {
  return async (c) => {
    const { conversationId } = c.req.valid("param");
    try {
      const conversation = await service.getConversation(conversationId);

      if (conversation === undefined) {
        const response = {
          error: {
            code: "not_found",
            message: "The requested resource was not found.",
          },
        } satisfies NotFoundErrorResponse;

        return c.json(response, 404);
      }
      return c.json(
        {
          data: toConversationDto(conversation),
        },
        200,
      );
    } catch {
      const response = {
        error: {
          code: "internal_server_error",
          message: "An unexpected server error occurred.",
        },
      } satisfies InternalServerErrorResponse;

      return c.json(response, 500);
    }
  };
}
