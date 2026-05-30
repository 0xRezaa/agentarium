import { env } from "#chat-assistant/web/env";
import type { HealthResponse } from "./types";

type Fetch = typeof globalThis.fetch;

export class ApiClient {
  private readonly fetch: Fetch;
  private readonly baseUrl: string;
  constructor(fetch: Fetch, baseUrl: string) {
    this.fetch = fetch;
    this.baseUrl = baseUrl;
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await this.fetch(`${this.baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error(
        `Health check failed with status ${String(response.status)}`,
      );
    }

    return response.json() as Promise<HealthResponse>;
  }
}

export const apiClient = new ApiClient(globalThis.fetch, env.VITE_API_BASE_URL);
