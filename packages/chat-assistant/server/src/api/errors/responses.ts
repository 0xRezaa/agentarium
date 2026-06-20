import { createJsonOpenApiResponse } from "../responses.js";
import {
  apiErrorResponseSchema,
  createApiErrorResponse,
  type ApiErrorResponse,
} from "./schemas.js";

function createApiErrorOpenApiResponse({
  description,
  error,
}: {
  description: string;
  error: ApiErrorResponse["error"];
}) {
  return createJsonOpenApiResponse({
    description,
    schema: apiErrorResponseSchema,
    example: createApiErrorResponse(error),
  });
}

export const badRequestResponse = createApiErrorOpenApiResponse({
  description: "The request is invalid.",
  error: {
    code: "bad_request",
    message: "The request is invalid.",
  },
});

export const validationFailedResponse = createApiErrorOpenApiResponse({
  description: "The request failed validation.",
  error: {
    code: "validation_failed",
    message: "Request validation failed.",
  },
});

export const notFoundResponse = createApiErrorOpenApiResponse({
  description: "The requested resource was not found.",
  error: {
    code: "not_found",
    message: "The requested resource was not found.",
  },
});

export const conflictResponse = createApiErrorOpenApiResponse({
  description: "The request conflicts with the current resource state.",
  error: {
    code: "conflict",
    message: "The request conflicts with the current resource state.",
  },
});

export const rateLimitedResponse = createApiErrorOpenApiResponse({
  description: "Too many requests.",
  error: {
    code: "rate_limited",
    message: "Too many requests.",
  },
});

export const internalServerErrorResponse = createApiErrorOpenApiResponse({
  description: "An unexpected server error occurred.",
  error: {
    code: "internal_server_error",
    message: "An unexpected server error occurred.",
  },
});

export const serviceUnavailableResponse = createApiErrorOpenApiResponse({
  description: "A required dependency is unavailable.",
  error: {
    code: "service_unavailable",
    message: "A required dependency is unavailable.",
  },
});
