import { OpenAPIHono } from "@hono/zod-openapi";
import { healthRoute } from "./health/index.js";

export const v1Api = new OpenAPIHono();

v1Api.route("/", healthRoute);
