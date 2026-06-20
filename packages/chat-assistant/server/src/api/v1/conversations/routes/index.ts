import { createApiRouter } from "../../../router.js";
import {
  getConversationHandler,
  getConversationOpenApiRoute,
} from "./get-conversation.js";

export const conversationRouter = createApiRouter();

conversationRouter.openapi(getConversationOpenApiRoute, getConversationHandler);
