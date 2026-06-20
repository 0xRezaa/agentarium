import type { OpenAPIHonoOptions } from "@hono/zod-openapi";
import type { Env } from "hono/types";
import { createApiErrorResponse, type ApiErrorDetail } from "./schemas.js";

function formatIssuePath(path: readonly PropertyKey[]): ApiErrorDetail["path"] {
  return path.map((part) => {
    if (typeof part === "symbol") {
      return part.description ?? part.toString();
    }

    return part;
  });
}

export const validationErrorHook: NonNullable<
  OpenAPIHonoOptions<Env>["defaultHook"]
> = (result, c) => {
  if (result.success) {
    return;
  }

  return c.json(
    createApiErrorResponse({
      code: "validation_failed",
      message: "Request validation failed.",
      details: result.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: formatIssuePath(issue.path),
      })),
    }),
    400,
  );
};
