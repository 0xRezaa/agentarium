import type { Initializable } from "./types";

export function isInitializable(obj: unknown): obj is Initializable {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "ensureInitialized" in obj &&
    typeof (obj as Initializable).ensureInitialized === "function"
  );
}
