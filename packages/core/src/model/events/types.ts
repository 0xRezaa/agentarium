import type { ModelDeltaEvent } from "./delta.js";
import type { ModelFinalEvent } from "./final.js";

/** All normalized events emitted by a streaming model adapter. */
export type ModelStreamEvent = ModelDeltaEvent | ModelFinalEvent;
