import { useServerHealthStatus } from "./hooks/use-server-health-status";

export function App() {
  const { healthStatus, error } = useServerHealthStatus();
  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">Agentarium demo</p>
        <h1>Chat Assistant</h1>
        <p>
          A simple browser-native chat assistant with branching conversations is
          coming soon.
        </p>
        {error ? (
          <p>Failed to retrieve server status</p>
        ) : (
          <p>
            The status of the server is:{" "}
            {healthStatus !== null ? String(healthStatus) : "...loading"}
          </p>
        )}
      </section>
    </main>
  );
}
