import type { Tool } from "../tool/types.js";
import type { ModelAdapter } from "../model/types.js";
import type { AgentId } from "./id.js";

/**
 * Agent loop phases
 *
 * - `agent`: the full agent execution.
 * - `model`: one LLM call.
 * - `tool`: one tool execution.
 */
type AgentPhase = "agent" | "model" | "tool";

/**
 * Lifecycle moments for each agent loop phase.
 *
 * - `start`: the phase begins.
 * - `complete`: the phase finished successfully.
 * - `error`: the phase failed.
 */
type AgentLifecycleMoment = "start" | "complete" | "error";

export type AgentLifecyclePoint = `${AgentPhase}:${AgentLifecycleMoment}`;

export interface Agent {
  id: AgentId;
  name?: string;
  instructions: string;
  model: ModelAdapter;
  tools?: Tool[];
}
