/**
 * Configuration options for LLM text generation.
 * These options cover the industry standard (OpenAI) as well as extensions
 * commonly used by local runners (Ollama, WebLLM).
 *
 * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
 * @see Ollama OpenAI compatibility: https://docs.ollama.com/api/openai-compatibility
 * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
 */
export interface GenerationOptions {
  /**
   * ID of the model to use (e.g., "gpt-4o", "llama3").
   *
   * @see OpenAI model guide: https://developers.openai.com/api/docs/models
   * @see Ollama chat API: https://docs.ollama.com/api/chat
   * @see WebLLM model loading: https://webllm.mlc.ai/docs/user/basic_usage.html
   */
  model?: string;

  /**
   * Controls randomness in the output.
   * Higher values (up to 2.0) make the output more random, while lower values
   * (closer to 0) make it more focused and deterministic.
   *
   * @default 1.0
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see Ollama generation parameters: https://docs.ollama.com/modelfile#valid-parameters-and-values
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  temperature?: number;

  /**
   * The maximum number of tokens that can be generated in the chat completion.
   * Acts as a hard limit on the response length.
   *
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see Ollama num_predict parameter: https://docs.ollama.com/modelfile#valid-parameters-and-values
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  maxTokens?: number;

  /**
   * An alternative to sampling with temperature, called nucleus sampling.
   * The model considers the results of the tokens with top_p probability mass.
   * For example, 0.1 means only the tokens comprising the top 10% probability mass are considered.
   *
   * @default 1.0
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see Ollama generation parameters: https://docs.ollama.com/modelfile#valid-parameters-and-values
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  topP?: number;

  /**
   * Limits the next-token selection pool to the top K most probable tokens.
   * Highly effective for reducing hallucinations in local models.
   *
   * **Note:** This is NOT supported by the official OpenAI API (strip it out before sending),
   * and is not part of WebLLM's documented OpenAI-style GenerationConfig. It maps
   * directly to Ollama's `top_k` option and other local-runtime sampling APIs.
   *
   * @see Ollama generation parameters: https://docs.ollama.com/modelfile#valid-parameters-and-values
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  topK?: number;

  /**
   * Up to 4 sequences where the API will stop generating further tokens.
   * Useful for stopping the model from generating both sides of a conversation.
   *
   * @example ["\n", "User:"]
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see Ollama generation parameters: https://docs.ollama.com/modelfile#valid-parameters-and-values
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  stop?: string | string[];

  /**
   * If set to true, partial message deltas will be sent as Server-Sent Events (SSE)
   * as they become available, instead of waiting for the full response.
   *
   * @default false
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see Ollama streaming: https://docs.ollama.com/api/streaming
   * @see WebLLM streaming chat completion: https://webllm.mlc.ai/docs/user/basic_usage.html#streaming-chat-completion
   */
  stream?: boolean;

  /**
   * Positive values penalize new tokens based on whether they appear in the text so far.
   * Increases the model's likelihood to talk about new topics.
   *
   * @min -2.0
   * @max 2.0
   * @default 0
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  presencePenalty?: number;

  /**
   * Positive values penalize new tokens based on their existing frequency in the text so far.
   * Decreases the model's likelihood to repeat the exact same sentences or words.
   *
   * @min -2.0
   * @max 2.0
   * @default 0
   * @see OpenAI Chat Completions API: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
   * @see WebLLM GenerationConfig: https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig
   */
  frequencyPenalty?: number;
}
