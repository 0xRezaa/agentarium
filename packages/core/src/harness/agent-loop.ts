import type { AgentRunContext, AgentRunResult } from "./types.js";

export async function runAgentLoop<TContext>(
  context: AgentRunContext<TContext>,
): Promise<AgentRunResult> {
  const { runId } = context;
  const agentRunResult: AgentRunResult = {
    runId,
    status: "complete",
  };
  return Promise.resolve(agentRunResult);
}
