import type { Agent } from "../agent/types.js";
import { runAgentLoop } from "./agent-loop.js";
import { createAgentRunId } from "./id.js";
import type {
  AgentRunContext,
  AgentRunInput,
  HarnessRunOptions,
  IHarness,
} from "./types.js";

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
