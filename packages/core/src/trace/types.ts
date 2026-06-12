import type { AgentId } from "../agent/id.js";
import type { AgentLifecyclePoint } from "../agent/types.js";
import type { AgentRunId } from "../harness/id.js";
import type { TraceId } from "./id.js";

export interface TraceEvent<T = unknown> {
  readonly id: TraceId;
  readonly agentId: AgentId;
  readonly runId: AgentRunId;
  readonly point: AgentLifecyclePoint;
  readonly sequenceInRun: number;
  readonly timestamp: number;
  readonly payload?: T;
}

export interface TraceSink {
  emit(event: TraceEvent): void | Promise<void>;
}
