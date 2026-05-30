import { env } from "#chat-assistant/web/env";

type Fetch = typeof globalThis.fetch;

export class ApiClient {
  private readonly fetch: Fetch;
  private readonly baseUrl: string;
  constructor(fetch: Fetch, baseUrl: string) {
    this.fetch = fetch;
    this.baseUrl = baseUrl;
  }
}

export const apiClient = new ApiClient(globalThis.fetch, env.VITE_API_BASE_URL);
