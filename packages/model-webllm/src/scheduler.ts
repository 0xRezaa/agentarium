export class Scheduler {
  private queue: Promise<void> = Promise.resolve();
  private async acquireSlot(): Promise<() => void> {
    let release: (() => void) | undefined = undefined;

    const slot = new Promise<void>((resolve) => {
      release = resolve;
    });

    const previous = this.queue;
    this.queue = previous.catch(() => undefined).then(() => slot);

    await previous.catch(() => undefined);

    return () => {
      release?.();
    };
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const release = await this.acquireSlot();
    try {
      return await operation();
    } catch (error) {
      throw error;
    } finally {
      release();
    }
  }

  async *stream<T>(streamOperation: () => AsyncIterable<T>): AsyncIterable<T> {
    const release = await this.acquireSlot();
    try {
      yield* streamOperation();
    } finally {
      release();
    }
  }
}
