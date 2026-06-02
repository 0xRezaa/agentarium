import type { paths } from "./openapi-generated";

type JsonResponse<
  Operation,
  Status extends PropertyKey = 200,
> = Operation extends { responses: infer Responses }
  ? Status extends keyof Responses
    ? Responses[Status] extends {
        content: { "application/json": infer ResponseBody };
      }
      ? ResponseBody
      : never
    : never
  : never;

export type ApiResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path],
  Status extends PropertyKey = 200,
> = JsonResponse<paths[Path][Method], Status>;

export type GetResponse<
  Path extends keyof paths,
  Status extends PropertyKey = 200,
> = paths[Path] extends { get: infer Operation }
  ? JsonResponse<Operation, Status>
  : never;

export type HealthResponse = GetResponse<"/api/v1/health">;

export type Fetch = typeof globalThis.fetch;
