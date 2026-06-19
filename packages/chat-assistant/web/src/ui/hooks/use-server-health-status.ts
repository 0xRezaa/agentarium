import { apiClient } from "#chat-assistant/api/client";
import { useEffect, useState } from "react";

export function useServerHealthStatus() {
  const [status, setStatus] = useState<boolean | null>();
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    apiClient
      .getHealth()
      .then((response) => {
        setStatus(response.ok);
      })
      .catch((error: unknown) => {
        console.error(
          "Error fetching server health status:",
          error instanceof Error ? error.message : error,
        );
        setError(true);
      });
  }, []);

  return { healthStatus: status, error };
}
