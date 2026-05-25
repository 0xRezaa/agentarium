import type { AgentId } from "#core/agent/id";
import type { AgentLifecyclePoint } from "#core/agent/types";
import type { AgentRunId } from "#core/harness/id";
import type { TraceId } from "./id";

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
