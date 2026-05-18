import type { AgentRunContext, AgentRunResult } from "./types";

export async function runAgentLoop<TContext>(
  context: AgentRunContext<TContext>,
): Promise<AgentRunResult> {
  const { runId } = context;
  const agentRunResult: AgentRunResult = {
    runId,
    status: "complete",
  };
  return agentRunResult;
}
