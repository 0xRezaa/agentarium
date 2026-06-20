import { createApiErrorOpenApiResponse } from "./schemas.js";

export const badRequestResponse = createApiErrorOpenApiResponse({
  code: "bad_request",
  description: "The request is invalid.",
  message: "The request is invalid.",
});

export const validationFailedResponse = createApiErrorOpenApiResponse({
  code: "validation_failed",
  description: "The request failed validation.",
  message: "Request validation failed.",
});

export const notFoundResponse = createApiErrorOpenApiResponse({
  code: "not_found",
  description: "The requested resource was not found.",
  message: "The requested resource was not found.",
});

export const conflictResponse = createApiErrorOpenApiResponse({
  code: "conflict",
  description: "The request conflicts with the current resource state.",
  message: "The request conflicts with the current resource state.",
});

export const rateLimitedResponse = createApiErrorOpenApiResponse({
  code: "rate_limited",
  description: "Too many requests.",
  message: "Too many requests.",
});

export const internalServerErrorResponse = createApiErrorOpenApiResponse({
  code: "internal_server_error",
  description: "An unexpected server error occurred.",
  message: "An unexpected server error occurred.",
});

export const serviceUnavailableResponse = createApiErrorOpenApiResponse({
  code: "service_unavailable",
  description: "A required dependency is unavailable.",
  message: "A required dependency is unavailable.",
});
