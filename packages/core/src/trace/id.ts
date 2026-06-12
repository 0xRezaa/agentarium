import type { Branded } from "../types.js";

export type TraceId = Branded<string, "TraceId">;

export function createTraceId(): TraceId {
  return crypto.randomUUID() as TraceId;
}
