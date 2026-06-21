import { createApiRouter } from "../router.js";
import { healthRoute } from "./health/index.js";
import {
  createConversationRouter,
  type ConversationRouteDependencies,
} from "./conversations/index.js";

export interface V1ApiDependencies {
  conversations: ConversationRouteDependencies;
}

export function createV1Api({ conversations }: V1ApiDependencies) {
  const v1Api = createApiRouter();

  v1Api.route("/", healthRoute);
  v1Api.route("/conversations", createConversationRouter(conversations));

  return v1Api;
}
