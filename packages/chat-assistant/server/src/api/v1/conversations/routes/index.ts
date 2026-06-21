import type { GetConversationService } from "../../../../domain/conversations/types.js";
import { createApiRouter } from "../../../router.js";
import {
  createConversationHandler,
  createConversationOpenApiRoute,
} from "./create-conversation.js";
import {
  createGetConversationHandler,
  getConversationOpenApiRoute,
} from "./get-conversation.js";

export interface ConversationRouteDependencies {
  conversationService: GetConversationService;
}

export function createConversationRouter({
  conversationService,
}: ConversationRouteDependencies) {
  const conversationRouter = createApiRouter();

  conversationRouter.openapi(
    createConversationOpenApiRoute,
    createConversationHandler,
  );
  conversationRouter.openapi(
    getConversationOpenApiRoute,
    createGetConversationHandler(conversationService),
  );

  return conversationRouter;
}
