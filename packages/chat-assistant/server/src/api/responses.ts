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

export function createJsonOpenApiResponse<DataSchema extends z.ZodType>({
  description,
  example,
  schema,
}: {
  description: string;
  example?: unknown;
  schema: DataSchema;
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
