/** Token/accounting metadata for a model invocation. */
export interface ModelUsage {
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly totalTokens?: number;
  readonly source?: "provider" | "estimated";
}
