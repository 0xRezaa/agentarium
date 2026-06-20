import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import {
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
  type InternalServerErrorResponse,
  type NotFoundErrorResponse,
} from "../../../errors/index.js";
import { createJsonOpenApiResponse } from "../../../responses.js";
import {
  conversationParamsSchema,
  conversationResponseSchema,
} from "../schemas.js";
import { ConversationRepository } from "../../../../domain/conversations/respository.js";
import { db } from "../../../../db/database.js";
import { ConversationService } from "../../../../domain/conversations/service.js";
import { toConversationDto } from "../mappers.js";

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

const conversationRepository = new ConversationRepository(db);
const conversationService = new ConversationService(conversationRepository);

export const getConversationHandler: RouteHandler<
  typeof getConversationOpenApiRoute
> = async (c) => {
  const { conversationId } = c.req.valid("param");
  try {
    const conversation =
      await conversationService.getConversation(conversationId);

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
