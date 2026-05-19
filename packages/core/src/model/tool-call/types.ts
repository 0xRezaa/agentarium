/** A normalized request from the model to execute a named tool. */
export interface ModelToolCall<Input = unknown> {
  id: string;
  name: string;
  input: Input;
}
