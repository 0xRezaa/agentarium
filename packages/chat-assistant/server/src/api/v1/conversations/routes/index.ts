import { createApiRouter } from "../../../router.js";
import {
  createConversationHandler,
  createConversationOpenApiRoute,
} from "./create-conversation.js";
import {
  getConversationHandler,
  getConversationOpenApiRoute,
} from "./get-conversation.js";

export const conversationRouter = createApiRouter();

conversationRouter.openapi(
  createConversationOpenApiRoute,
  createConversationHandler,
);
conversationRouter.openapi(getConversationOpenApiRoute, getConversationHandler);
