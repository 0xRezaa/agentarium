import { describe, expect, it } from "vitest";
import { Scheduler } from "./scheduler";
import { deferred, toAsyncIterator } from "../../test-kit/utils";

describe("Scheduler", () => {
  it("runs the next operation after the current operation completes", async () => {
    const scheduler = new Scheduler();
    const firstStarted = deferred();
    const firstCanFinish = deferred();
    let firstFinished = false;

    const first = scheduler.run(async () => {
      firstStarted.resolve(undefined);
      await firstCanFinish.promise;
      firstFinished = true;
    });

    const second = scheduler.run(() => {
      expect(firstFinished).toBe(true);
      return Promise.resolve();
    });

    await firstStarted.promise;

    firstCanFinish.resolve(undefined);

    await first;
    await second;
  });

  it("continues with the next operation after a rejection", async () => {
    const scheduler = new Scheduler();
    const firstStarted = deferred();
    const firstCanReject = deferred();
    let firstRejected = false;

    const first = scheduler.run(async () => {
      firstStarted.resolve(undefined);
      try {
        await firstCanReject.promise;
      } catch (error) {
        firstRejected = true;
        throw error;
      }
    });

    const second = scheduler.run(() => {
      expect(firstRejected).toBe(true);
      return Promise.resolve();
    });

    await firstStarted.promise;

    firstCanReject.reject(new Error("first failed"));

    await expect(first).rejects.toThrow("first failed");
    await second;
  });

  it("keeps a stream slot until the stream completes", async () => {
    const scheduler = new Scheduler();
    const streamCanFinish = deferred();
    const streamIsWaiting = deferred();
    let streamClosed = false;

    const iterator = toAsyncIterator(
      scheduler.stream(async function* () {
        try {
          yield "chunk";
          streamIsWaiting.resolve(undefined);
          await streamCanFinish.promise;
        } finally {
          streamClosed = true;
        }
      }),
    );

    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(() => {
      expect(streamClosed).toBe(true);
      return Promise.resolve();
    });

    const streamDone = iterator.next();
    await streamIsWaiting.promise;

    streamCanFinish.resolve(undefined);

    await expect(streamDone).resolves.toEqual({
      value: undefined,
      done: true,
    });
    await queuedRun;
  });

  it("continues when a stream consumer stops early", async () => {
    const scheduler = new Scheduler();
    let streamClosed = false;

    const iterator = toAsyncIterator(
      scheduler.stream(async function* () {
        try {
          yield Promise.resolve("chunk");
        } finally {
          streamClosed = true;
        }
      }),
    );

    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(() => {
      expect(streamClosed).toBe(true);
      return Promise.resolve();
    });

    await iterator.return?.(undefined);
    await queuedRun;
  });

  it("continues when a stream throws while iterating", async () => {
    const scheduler = new Scheduler();
    let streamClosed = false;

    const iterator = toAsyncIterator(
      scheduler.stream(async function* () {
        try {
          yield Promise.resolve("chunk");
          throw new Error("stream failed");
        } finally {
          streamClosed = true;
        }
      }),
    );
    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(() => {
      expect(streamClosed).toBe(true);
      return Promise.resolve();
    });

    await expect(iterator.next()).rejects.toThrow("stream failed");
    await queuedRun;
  });

  it("does not acquire a stream slot until iteration begins", async () => {
    const scheduler = new Scheduler();
    let streamStarted = false;

    const stream = scheduler.stream(async function* () {
      streamStarted = true;
      yield Promise.resolve("chunk");
    });

    await scheduler.run(() => Promise.resolve());

    expect(streamStarted).toBe(false);

    await expect(toAsyncIterator(stream).next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    expect(streamStarted).toBe(true);
  });
});
