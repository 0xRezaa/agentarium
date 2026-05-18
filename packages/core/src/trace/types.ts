import { AgentId } from "#core/agent/id";
import { AgentLifecyclePoint } from "#core/agent/types";
import { AgentRunId } from "#core/harness/id";
import { TraceId } from "./id";

export interface TraceEvent<T = unknown> {
  id: TraceId;
  agentId: AgentId;
  runId: AgentRunId;
  point: AgentLifecyclePoint;
  sequenceInRun: number;
  timestamp: number;
  payload?: T;
}
