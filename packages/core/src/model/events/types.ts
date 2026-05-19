import type { ModelDeltaEvent } from "./delta";
import type { ModelFinalEvent } from "./final";

/** All normalized events emitted by a streaming model adapter. */
export type ModelStreamEvent = ModelDeltaEvent | ModelFinalEvent;
