/** Token/accounting metadata for a model invocation. */
export interface ModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  source?: "provider" | "estimated";
}
