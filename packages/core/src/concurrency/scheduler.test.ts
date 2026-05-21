import { describe, expect, it } from "vitest";
import { Scheduler } from "./scheduler";
import { deferred } from "../../test-kit/utils";

describe("Scheduler", () => {
  it("runs the next operation after the current operation completes", async () => {
    const scheduler = new Scheduler();
    const firstStarted = deferred<void>();
    const firstCanFinish = deferred<void>();
    let firstFinished = false;

    const first = scheduler.run(async () => {
      firstStarted.resolve(undefined);
      await firstCanFinish.promise;
      firstFinished = true;
    });

    const second = scheduler.run(async () => {
      expect(firstFinished).toBe(true);
    });

    await firstStarted.promise;

    firstCanFinish.resolve(undefined);

    await first;
    await second;
  });

  it("continues with the next operation after a rejection", async () => {
    const scheduler = new Scheduler();
    const firstStarted = deferred<void>();
    const firstCanReject = deferred<void>();
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

    const second = scheduler.run(async () => {
      expect(firstRejected).toBe(true);
    });

    await firstStarted.promise;

    firstCanReject.reject(new Error("first failed"));

    await expect(first).rejects.toThrow("first failed");
    await second;
  });

  it("holds the queue for the full lifetime of a stream", async () => {
    const scheduler = new Scheduler();
    const streamCanFinish = deferred<void>();
    const streamIsWaiting = deferred<void>();
    const events: string[] = [];

    const stream = scheduler.stream(async function* () {
      events.push("stream:start");
      yield "first-chunk";
      events.push("stream:waiting");
      streamIsWaiting.resolve(undefined);
      await streamCanFinish.promise;
      events.push("stream:end");
      yield "second-chunk";
    });

    const iterator = stream[Symbol.asyncIterator]();

    await expect(iterator.next()).resolves.toEqual({
      value: "first-chunk",
      done: false,
    });

    const queuedRun = scheduler.run(async () => {
      events.push("run:start");
      return "run-result";
    });

    expect(events).toEqual(["stream:start"]);

    const pendingNext = iterator.next();
    await streamIsWaiting.promise;

    expect(events).toEqual(["stream:start", "stream:waiting"]);

    streamCanFinish.resolve(undefined);

    await expect(pendingNext).resolves.toEqual({
      value: "second-chunk",
      done: false,
    });

    await expect(iterator.next()).resolves.toEqual({
      value: undefined,
      done: true,
    });
    await expect(queuedRun).resolves.toBe("run-result");

    expect(events).toEqual([
      "stream:start",
      "stream:waiting",
      "stream:end",
      "run:start",
    ]);
  });

  it("continues when a stream consumer stops early", async () => {
    const scheduler = new Scheduler();
    let streamClosed = false;

    const iterator = obtainAsyncIterator(
      scheduler.stream(async function* () {
      try {
        yield "chunk";
      } finally {
          streamClosed = true;
      }
      }),
    );

    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(async () => {
      expect(streamClosed).toBe(true);
    });

    await iterator.return?.(undefined);
    await queuedRun;
  });

  it("continues when a stream throws while iterating", async () => {
    const scheduler = new Scheduler();
    let streamFailed = false;

    const iterator = obtainAsyncIterator(
      scheduler.stream(async function* () {
      yield "chunk";
        streamFailed = true;
      throw new Error("stream failed");
      }),
    );
    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(async () => {
      expect(streamFailed).toBe(true);
    });

    await expect(iterator.next()).rejects.toThrow("stream failed");
    await queuedRun;
  });

  it("does not acquire a stream slot until iteration begins", async () => {
    const scheduler = new Scheduler();
    let streamStarted = false;

    const stream = scheduler.stream(async function* () {
      streamStarted = true;
      yield "chunk";
    });

    await scheduler.run(async () => undefined);

    expect(streamStarted).toBe(false);

    await expect(obtainAsyncIterator(stream).next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    expect(streamStarted).toBe(true);
  });
});

function expectEventually<T>(actual: () => T) {
  return expect.poll(actual, { interval: 1, timeout: 100 });
}
