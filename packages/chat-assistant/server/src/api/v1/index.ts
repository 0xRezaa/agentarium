import { createApiRouter } from "../router.js";
import { healthRoute } from "./health/index.js";

export const v1Api = createApiRouter();

v1Api.route("/", healthRoute);
