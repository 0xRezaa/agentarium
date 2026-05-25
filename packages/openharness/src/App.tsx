import type { Initializable } from "@0xrezaa/core/lifecycle";
import type {
  AssistantContent,
  ModelAdapter,
  ModelRequest,
  ModelResponse,
  ModelStreamEvent,
  ModelUsage,
} from "@0xrezaa/core/model";
import type { InitProgressReport } from "@0xrezaa/model-webllm";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { buildModelRequest } from "./model-request";
import {
  createOpenHarnessMockAdapter,
  type MockScenario,
} from "./mock-adapter";
import {
  CURATED_WEBLLM_MODEL_IDS,
  DEFAULT_WEBLLM_MODEL_ID,
  createCuratedWebLLMModelMap,
  type CuratedWebLLMModelId,
} from "./webllm-catalog";

type AdapterKind = "mock" | "webllm";
type RunMode = "stream" | "generate";
type RunStatus = "idle" | "loading" | "running" | "complete" | "error";

type InspectableAdapter = ModelAdapter &
  Partial<Initializable> & {
    dispose?: () => Promise<void>;
  };

interface WebLLMAdapterHandle {
  modelId: CuratedWebLLMModelId;
  adapter: InspectableAdapter;
}

const initialSystemPrompt = "You are a concise adapter smoke-test model.";
const initialUserPrompt =
  "Reply with one short sentence about WebLLM adapter inspection.";

export function App() {
  const [adapterKind, setAdapterKind] = useState<AdapterKind>("mock");
  const [mockScenario, setMockScenario] = useState<MockScenario>("text");
  const [selectedWebLLMModelId, setSelectedWebLLMModelId] =
    useState<CuratedWebLLMModelId>(DEFAULT_WEBLLM_MODEL_ID);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [userPrompt, setUserPrompt] = useState(initialUserPrompt);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [lastRunMode, setLastRunMode] = useState<RunMode | undefined>();
  const [events, setEvents] = useState<ModelStreamEvent[]>([]);
  const [accumulatedText, setAccumulatedText] = useState("");
  const [response, setResponse] = useState<ModelResponse | undefined>();
  const [usage, setUsage] = useState<ModelUsage | undefined>();
  const [progress, setProgress] = useState<InitProgressReport | undefined>();
  const [error, setError] = useState<string | undefined>();

  const webLLMAdapterRef = useRef<WebLLMAdapterHandle | undefined>(undefined);

  const modelRequest = useMemo(
    () => buildModelRequest({ systemPrompt, userPrompt }),
    [systemPrompt, userPrompt],
  );
  const isBusy = status === "loading" || status === "running";
  const canRun = userPrompt.trim().length > 0 && !isBusy;

  useEffect(
    () => () => {
      const handle = webLLMAdapterRef.current;
      webLLMAdapterRef.current = undefined;
      void handle?.adapter.dispose?.();
    },
    [],
  );

  async function disposeWebLLMAdapter(): Promise<void> {
    const handle = webLLMAdapterRef.current;
    webLLMAdapterRef.current = undefined;
    await handle?.adapter.dispose?.();
  }

  async function resolveAdapter(): Promise<InspectableAdapter> {
    if (adapterKind === "mock") {
      return createOpenHarnessMockAdapter(mockScenario);
    }

    const existingAdapter = webLLMAdapterRef.current;
    if (existingAdapter?.modelId === selectedWebLLMModelId) {
      return existingAdapter.adapter;
    }

    await disposeWebLLMAdapter();

    const [{ createWebLLMAdapter }, models] = await Promise.all([
      import("@0xrezaa/model-webllm"),
      createCuratedWebLLMModelMap(),
    ]);
    const adapter = createWebLLMAdapter({
      models,
      modelKey: selectedWebLLMModelId,
      initProgressCallback: setProgress,
    });

    webLLMAdapterRef.current = {
      modelId: selectedWebLLMModelId,
      adapter,
    };

    return adapter;
  }

  async function runAdapter(mode: RunMode): Promise<void> {
    resetRunState(mode);

    try {
      const adapter = await resolveAdapter();

      if (isInitializable(adapter)) {
        setStatus("loading");
        await adapter.ensureInitialized();
      }

      setStatus("running");

      if (mode === "stream") {
        await runStream(adapter, modelRequest);
      } else {
        await runGenerate(adapter, modelRequest);
      }

      setStatus("complete");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setStatus("error");
    }
  }

  async function runStream(
    adapter: ModelAdapter,
    request: ModelRequest,
  ): Promise<void> {
    for await (const event of adapter.stream(request)) {
      setEvents((currentEvents) => [...currentEvents, event]);
      applyStreamEvent(event);
    }
  }

  async function runGenerate(
    adapter: ModelAdapter,
    request: ModelRequest,
  ): Promise<void> {
    const modelResponse = await adapter.generate(request);
    setResponse(modelResponse);
    setAccumulatedText(getTextFromContent(modelResponse.message.content));
    setUsage(modelResponse.usage);
  }

  function applyStreamEvent(event: ModelStreamEvent): void {
    if (event.type === "model:text-delta") {
      setAccumulatedText((currentText) => currentText + event.delta);
      return;
    }

    if (event.type === "model:response") {
      setResponse({
        message: {
          role: "assistant",
          content: event.content,
        },
        finish: event.finish,
      });
      return;
    }

    if (event.type === "model:usage") {
      setUsage(event.usage);
      setResponse((currentResponse) =>
        currentResponse
          ? { ...currentResponse, usage: event.usage }
          : currentResponse,
      );
    }
  }

  function resetRunState(mode: RunMode): void {
    setLastRunMode(mode);
    setStatus(adapterKind === "webllm" ? "loading" : "running");
    setEvents([]);
    setAccumulatedText("");
    setResponse(undefined);
    setUsage(undefined);
    setProgress(undefined);
    setError(undefined);
  }

  function selectAdapterKind(kind: AdapterKind): void {
    setAdapterKind(kind);

    if (kind === "mock") {
      void disposeWebLLMAdapter();
    }
  }

  function selectWebLLMModel(modelId: CuratedWebLLMModelId): void {
    setSelectedWebLLMModelId(modelId);
    void disposeWebLLMAdapter();
  }

  return (
    <main className="app-shell">
      <section className="workspace-heading" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">OpenHarness</p>
          <h1 id="app-title">Adapter Inspector</h1>
        </div>
        <StatusBadge status={status} />
      </section>

      <div className="inspector-grid">
        <section
          className="panel controls-panel"
          aria-labelledby="controls-title"
        >
          <div className="panel-heading">
            <h2 id="controls-title">Controls</h2>
          </div>

          <fieldset className="control-group">
            <legend>Adapter</legend>
            <div className="segmented-control">
              <button
                type="button"
                aria-pressed={adapterKind === "mock"}
                disabled={isBusy}
                onClick={() => {
                  selectAdapterKind("mock");
                }}
              >
                Mock
              </button>
              <button
                type="button"
                aria-pressed={adapterKind === "webllm"}
                disabled={isBusy}
                onClick={() => {
                  selectAdapterKind("webllm");
                }}
              >
                WebLLM
              </button>
            </div>
          </fieldset>

          {adapterKind === "mock" ? (
            <label className="field">
              <span>Mock scenario</span>
              <select
                value={mockScenario}
                disabled={isBusy}
                onChange={(event) => {
                  setMockScenario(event.currentTarget.value as MockScenario);
                }}
              >
                <option value="text">Text response</option>
                <option value="tool-call">Tool call response</option>
              </select>
            </label>
          ) : (
            <label className="field">
              <span>WebLLM model</span>
              <select
                value={selectedWebLLMModelId}
                disabled={isBusy}
                onChange={(event) => {
                  selectWebLLMModel(
                    event.currentTarget.value as CuratedWebLLMModelId,
                  );
                }}
              >
                {CURATED_WEBLLM_MODEL_IDS.map((modelId) => (
                  <option key={modelId} value={modelId}>
                    {modelId}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span>System prompt</span>
            <textarea
              value={systemPrompt}
              disabled={isBusy}
              rows={4}
              onChange={(event) => {
                setSystemPrompt(event.currentTarget.value);
              }}
            />
          </label>

          <label className="field">
            <span>User prompt</span>
            <textarea
              value={userPrompt}
              disabled={isBusy}
              rows={6}
              onChange={(event) => {
                setUserPrompt(event.currentTarget.value);
              }}
            />
          </label>

          <div className="run-actions" aria-label="Run adapter">
            <button
              type="button"
              className="primary-action"
              disabled={!canRun}
              onClick={() => {
                void runAdapter("stream");
              }}
            >
              Stream
            </button>
            <button
              type="button"
              disabled={!canRun}
              onClick={() => {
                void runAdapter("generate");
              }}
            >
              Generate
            </button>
          </div>
        </section>

        <section
          className="panel request-panel"
          aria-labelledby="request-title"
        >
          <div className="panel-heading">
            <h2 id="request-title">ModelRequest</h2>
          </div>
          <JsonBlock value={modelRequest} />
        </section>

        <section className="panel" aria-labelledby="progress-title">
          <div className="panel-heading">
            <h2 id="progress-title">Progress</h2>
            {lastRunMode ? (
              <span className="mode-label">{lastRunMode}</span>
            ) : null}
          </div>
          <ProgressPanel progress={progress} adapterKind={adapterKind} />
          {error ? <div className="error-box">{error}</div> : null}
        </section>

        <section className="panel output-panel" aria-labelledby="output-title">
          <div className="panel-heading">
            <h2 id="output-title">Output</h2>
          </div>
          <pre className="text-output">
            {accumulatedText || "No output for the current run."}
          </pre>
        </section>

        <section className="panel events-panel" aria-labelledby="events-title">
          <div className="panel-heading">
            <h2 id="events-title">Events</h2>
            <span className="count-label">{events.length}</span>
          </div>
          {events.length ? (
            <ol className="event-list">
              {events.map((event, index) => (
                <li
                  key={`${String(index)}-${event.type}`}
                  className="event-row"
                >
                  <span>{event.type}</span>
                  <pre>{formatJson(event)}</pre>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-state">
              {lastRunMode === "generate"
                ? "generate() returned a response without stream events."
                : "No stream events for the current run."}
            </p>
          )}
        </section>

        <section
          className="panel response-panel"
          aria-labelledby="response-title"
        >
          <div className="panel-heading">
            <h2 id="response-title">Response</h2>
          </div>
          <JsonBlock value={response ?? null} />
        </section>

        <section className="panel usage-panel" aria-labelledby="usage-title">
          <div className="panel-heading">
            <h2 id="usage-title">Usage</h2>
          </div>
          <JsonBlock value={usage ?? null} />
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: RunStatus }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

function ProgressPanel({
  adapterKind,
  progress,
}: {
  adapterKind: AdapterKind;
  progress: InitProgressReport | undefined;
}) {
  const progressValue = progress?.progress ?? 0;
  const percent = Math.round(progressValue * 100);
  const percentLabel = `${String(percent)}%`;

  return (
    <div className="progress-panel">
      <div className="progress-track" aria-hidden="true">
        <div style={{ width: percentLabel }} />
      </div>
      <dl className="metric-grid">
        <div>
          <dt>Adapter</dt>
          <dd>{adapterKind === "webllm" ? "WebLLM" : "Mock"}</dd>
        </div>
        <div>
          <dt>Loaded</dt>
          <dd>{adapterKind === "webllm" ? percentLabel : "Ready"}</dd>
        </div>
        <div>
          <dt>Elapsed</dt>
          <dd>{progress ? `${progress.timeElapsed.toFixed(1)}s` : "-"}</dd>
        </div>
      </dl>
      <p>{progress?.text ?? "No load progress for the current run."}</p>
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="json-block">{formatJson(value)}</pre>;
}

function isInitializable(
  adapter: InspectableAdapter,
): adapter is ModelAdapter & Initializable {
  return typeof adapter.ensureInitialized === "function";
}

function getTextFromContent(content: AssistantContent): string {
  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
