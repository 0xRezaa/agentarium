import { OpenAPIHono } from "@hono/zod-openapi";
import { v1Api } from "./api/v1/index.js";

export const app = new OpenAPIHono();

app.route("/api/v1", v1Api);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Chat Assistant API",
    version: "1.0.0",
  },
});
