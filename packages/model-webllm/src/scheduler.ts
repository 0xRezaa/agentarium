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

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.acquireSlot();
    try {
      return await fn();
    } catch (error) {
      throw error;
    } finally {
      release();
    }
  }

  async *stream<T>(fn: () => AsyncIterable<T>): AsyncIterable<T> {
    const release = await this.acquireSlot();
    try {
      yield* fn();
    } finally {
      release();
    }
  }
}
