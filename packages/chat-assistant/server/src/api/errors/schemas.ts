import { z } from "@hono/zod-openapi";

const apiErrorCodes = [
  "validation_failed",
  "bad_request",
  "not_found",
  "conflict",
  "rate_limited",
  "internal_server_error",
  "service_unavailable",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export const apiErrorCodeSchema = z.enum(apiErrorCodes);

export const apiErrorMessages = {
  validation_failed: "Request validation failed.",
  bad_request: "The request is invalid.",
  not_found: "The requested resource was not found.",
  conflict: "The request conflicts with the current resource state.",
  rate_limited: "Too many requests.",
  internal_server_error: "An unexpected server error occurred.",
  service_unavailable: "A required dependency is unavailable.",
} as const satisfies Record<ApiErrorCode, string>;

export type ApiErrorMessage<Code extends ApiErrorCode> =
  (typeof apiErrorMessages)[Code];

export const apiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
});

const apiErrorPayloadBaseSchema = {
  details: z.array(apiErrorDetailSchema).optional(),
  requestId: z.string().optional(),
};

const validationFailedErrorPayloadSchema = z.object({
  code: z.literal("validation_failed"),
  message: z.literal(apiErrorMessages.validation_failed),
  ...apiErrorPayloadBaseSchema,
});

const badRequestErrorPayloadSchema = z.object({
  code: z.literal("bad_request"),
  message: z.literal(apiErrorMessages.bad_request),
  ...apiErrorPayloadBaseSchema,
});

const notFoundErrorPayloadSchema = z.object({
  code: z.literal("not_found"),
  message: z.literal(apiErrorMessages.not_found),
  ...apiErrorPayloadBaseSchema,
});

const conflictErrorPayloadSchema = z.object({
  code: z.literal("conflict"),
  message: z.literal(apiErrorMessages.conflict),
  ...apiErrorPayloadBaseSchema,
});

const rateLimitedErrorPayloadSchema = z.object({
  code: z.literal("rate_limited"),
  message: z.literal(apiErrorMessages.rate_limited),
  ...apiErrorPayloadBaseSchema,
});

const internalServerErrorPayloadSchema = z.object({
  code: z.literal("internal_server_error"),
  message: z.literal(apiErrorMessages.internal_server_error),
  ...apiErrorPayloadBaseSchema,
});

const serviceUnavailableErrorPayloadSchema = z.object({
  code: z.literal("service_unavailable"),
  message: z.literal(apiErrorMessages.service_unavailable),
  ...apiErrorPayloadBaseSchema,
});

const apiErrorPayloadSchema = z.discriminatedUnion("code", [
  validationFailedErrorPayloadSchema,
  badRequestErrorPayloadSchema,
  notFoundErrorPayloadSchema,
  conflictErrorPayloadSchema,
  rateLimitedErrorPayloadSchema,
  internalServerErrorPayloadSchema,
  serviceUnavailableErrorPayloadSchema,
]);

export const apiErrorResponseSchema = z
  .object({
    error: apiErrorPayloadSchema,
  })
  .openapi("ApiErrorResponse", {
    example: {
      error: {
        code: "validation_failed",
        message: apiErrorMessages.validation_failed,
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

export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ApiErrorPayload = ApiErrorResponse["error"];
export type ApiErrorPayloadFor<Code extends ApiErrorCode> = Extract<
  ApiErrorPayload,
  { code: Code }
>;
export interface ApiErrorResponseFor<Code extends ApiErrorCode> {
  error: ApiErrorPayloadFor<Code>;
}
export type ValidationFailedErrorResponse =
  ApiErrorResponseFor<"validation_failed">;
export type BadRequestErrorResponse = ApiErrorResponseFor<"bad_request">;
export type NotFoundErrorResponse = ApiErrorResponseFor<"not_found">;
export type ConflictErrorResponse = ApiErrorResponseFor<"conflict">;
export type RateLimitedErrorResponse = ApiErrorResponseFor<"rate_limited">;
export type InternalServerErrorResponse =
  ApiErrorResponseFor<"internal_server_error">;
export type ServiceUnavailableErrorResponse =
  ApiErrorResponseFor<"service_unavailable">;

export function createApiErrorResponse(
  error: ApiErrorResponse["error"],
): ApiErrorResponse {
  return {
    error,
  };
}
