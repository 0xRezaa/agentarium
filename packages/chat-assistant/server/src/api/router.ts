import { OpenAPIHono } from "@hono/zod-openapi";
import { validationErrorHook } from "./errors/index.js";

export function createApiRouter(): OpenAPIHono {
  return new OpenAPIHono({
    defaultHook: validationErrorHook,
  });
}
