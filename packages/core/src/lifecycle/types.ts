export interface Initializable {
  ensureInitialized(): Promise<void>;
}

export interface Disposable {
  dispose(): Promise<void>;
}
