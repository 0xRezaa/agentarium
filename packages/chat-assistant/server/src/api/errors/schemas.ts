import { z } from "@hono/zod-openapi";

export const apiErrorCodeSchema = z.enum([
  "validation_failed",
  "bad_request",
  "not_found",
  "conflict",
  "rate_limited",
  "internal_server_error",
  "service_unavailable",
]);

export const apiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
});

export const apiErrorResponseSchema = z
  .object({
    error: z.object({
      code: apiErrorCodeSchema,
      message: z.string(),
      details: z.array(apiErrorDetailSchema).optional(),
      requestId: z.string().optional(),
    }),
  })
  .openapi("ApiErrorResponse", {
    example: {
      error: {
        code: "validation_failed",
        message: "Request validation failed.",
        details: [
          {
            code: "invalid_format",
            message: "Invalid UUID",
            path: ["conversationId"],
          },
        ],
      },
    },
  });

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

export function createApiErrorResponse({
  code,
  details,
  message,
  requestId,
}: {
  code: ApiErrorCode;
  details?: ApiErrorDetail[];
  message: string;
  requestId?: string;
}): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };
}

export function createApiErrorOpenApiResponse({
  code,
  description,
  message,
}: {
  code: ApiErrorCode;
  description: string;
  message: string;
}) {
  return {
    description,
    content: {
      "application/json": {
        schema: apiErrorResponseSchema,
        example: createApiErrorResponse({
          code,
          message,
        }),
      },
    },
  };
}
