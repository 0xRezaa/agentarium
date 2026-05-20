export interface Initializable {
  ensureInitialized(): Promise<void>;
}
