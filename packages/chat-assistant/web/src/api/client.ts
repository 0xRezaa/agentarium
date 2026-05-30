import { env } from "#chat-assistant/web/env";

export const API_BASE_URL = env.VITE_API_BASE_URL;

console.log(API_BASE_URL);
type Fetch = typeof globalThis.fetch;

export class ApiClient {
  private readonly fetch: Fetch;
  private readonly baseUrl: string;
  constructor(fetch: Fetch, baseUrl: string) {
    this.fetch = fetch;
    this.baseUrl = baseUrl;
  }
}

export const apiClient = new ApiClient(globalThis.fetch, API_BASE_URL);
