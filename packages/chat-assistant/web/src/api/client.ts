import { env } from "#chat-assistant/web/env";
import type { Fetch, HealthResponse } from "./types";

export class ApiClient {
  private readonly fetch: Fetch;
  private readonly baseUrl: string;
  constructor(fetch: Fetch, baseUrl: string) {
    this.fetch = fetch;
    this.baseUrl = baseUrl;
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await this.fetch(this.createPath("health"));
    if (!response.ok) {
      throw new Error(
        `Health check failed with status ${String(response.status)}`,
      );
    }

    return response.json() as Promise<HealthResponse>;
  }

  private createPath(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}

export const apiClient = new ApiClient(
  globalThis.fetch.bind(globalThis),
  env.VITE_API_BASE_PATH,
);
