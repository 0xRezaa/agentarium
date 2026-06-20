import { createApiRouter } from "../router.js";
import { healthRoute } from "./health/index.js";
import { conversationRouter } from "./conversations/index.js";

export const v1Api = createApiRouter();

v1Api.route("/", healthRoute);
v1Api.route("/conversations", conversationRouter);
