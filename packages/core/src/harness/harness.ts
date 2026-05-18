import type { Agent } from "#core/agent/types";
import { runAgentLoop } from "./agent-loop";
import { createAgentRunId } from "./id";
import type {
  AgentRunContext,
  AgentRunInput,
  HarnessRunOptions,
  IHarness,
} from "./types";

export class Harness implements IHarness {
  async run(agent: Agent, input: AgentRunInput, options?: HarnessRunOptions) {
    const agentRunId = createAgentRunId();
    const agentRunContext: AgentRunContext = {
      runId: agentRunId,
      agent,
      input,
      messages: [],
      iteration: 0,
      ...options,
    };
    return runAgentLoop(agentRunContext);
  }
}
