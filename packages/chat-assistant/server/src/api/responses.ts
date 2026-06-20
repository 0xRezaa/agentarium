import { z } from "@hono/zod-openapi";

export interface ApiDataResponse<T> {
  data: T;
}

export function createApiDataResponse<T>(data: T): ApiDataResponse<T> {
  return {
    data,
  };
}

export function createApiDataResponseSchema<DataSchema extends z.ZodType>(
  dataSchema: DataSchema,
) {
  return z.object({
    data: dataSchema,
  });
}

export function createJsonOpenApiResponse({
  description,
  example,
  schema,
}: {
  description: string;
  example?: unknown;
  schema: z.ZodType;
}) {
  return {
    description,
    content: {
      "application/json": {
        schema,
        ...(example === undefined ? {} : { example }),
      },
    },
  };
}
