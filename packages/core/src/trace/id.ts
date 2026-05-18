import { Branded } from "#core/types";

export type TraceId = Branded<string, "TraceId">;

export function createTraceId(): TraceId {
  return crypto.randomUUID() as TraceId;
}
