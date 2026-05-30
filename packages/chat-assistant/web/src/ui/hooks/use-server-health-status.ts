import { apiClient } from "#chat-assistant/web/api/client";
import { useEffect, useState } from "react";

export function useServerHealthStatus() {
  const [status, setStatus] = useState<boolean | null>();
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    apiClient
      .getHealth()
      .then((response) => {
        setStatus(response.ok);
      })
      .catch(() => {
        setError(error);
      });
  }, []);

  return { healthStatus: status, error };
}
