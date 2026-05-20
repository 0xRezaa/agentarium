import type { AgentId } from "#core/agent/id";
import type { AgentLifecyclePoint } from "#core/agent/types";
import type { AgentRunId } from "#core/harness/id";
import type { TraceId } from "./id";

export type * from "./id";

export interface TraceEvent<T = unknown> {
  id: TraceId;
  agentId: AgentId;
  runId: AgentRunId;
  point: AgentLifecyclePoint;
  sequenceInRun: number;
  timestamp: number;
  payload?: T;
}

export interface TraceSink {
  emit(event: TraceEvent): void | Promise<void>;
}
