import { describe, expect, it } from "vitest";
import { Scheduler } from "./scheduler";
import { deferred } from "../../test-kit/utils";

describe("Scheduler", () => {
  it("runs queued operations one at a time in FIFO order", async () => {
    const scheduler = new Scheduler();
    const firstCanFinish = deferred<void>();
    const secondCanFinish = deferred<void>();
    const events: string[] = [];

    const first = scheduler.run(async () => {
      events.push("first:start");
      await firstCanFinish.promise;
      events.push("first:end");
      return "first-result";
    });

    const second = scheduler.run(async () => {
      events.push("second:start");
      await secondCanFinish.promise;
      events.push("second:end");
      return "second-result";
    });

    const third = scheduler.run(async () => {
      events.push("third:start");
      return "third-result";
    });

    await expectEventually(() => [...events]).toEqual(["first:start"]);

    firstCanFinish.resolve(undefined);
    await expect(first).resolves.toBe("first-result");

    await expectEventually(() => [...events]).toEqual([
      "first:start",
      "first:end",
      "second:start",
    ]);

    secondCanFinish.resolve(undefined);
    await expect(second).resolves.toBe("second-result");
    await expect(third).resolves.toBe("third-result");

    expect(events).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
      "third:start",
    ]);
  });

  it("releases the queue after an operation rejects", async () => {
    const scheduler = new Scheduler();
    const firstCanReject = deferred<void>();
    const events: string[] = [];

    const first = scheduler.run(async () => {
      events.push("first:start");
      await firstCanReject.promise;
      events.push("first:unreachable");
    });

    const second = scheduler.run(async () => {
      events.push("second:start");
      return "second-result";
    });

    await expectEventually(() => [...events]).toEqual(["first:start"]);

    firstCanReject.reject(new Error("first failed"));

    await expect(first).rejects.toThrow("first failed");
    await expect(second).resolves.toBe("second-result");

    expect(events).toEqual(["first:start", "second:start"]);
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

  it("releases the queue when a stream consumer stops early", async () => {
    const scheduler = new Scheduler();
    const events: string[] = [];

    const stream = scheduler.stream(async function* () {
      try {
        events.push("stream:start");
        yield "chunk";
        events.push("stream:unreachable");
      } finally {
        events.push("stream:finally");
      }
    });

    const iterator = stream[Symbol.asyncIterator]();

    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(async () => {
      events.push("run:start");
      return "run-result";
    });

    expect(events).toEqual(["stream:start"]);

    await iterator.return?.(undefined);
    await expect(queuedRun).resolves.toBe("run-result");

    expect(events).toEqual(["stream:start", "stream:finally", "run:start"]);
  });

  it("releases the queue when a stream throws while iterating", async () => {
    const scheduler = new Scheduler();
    const events: string[] = [];

    const stream = scheduler.stream(async function* () {
      events.push("stream:start");
      yield "chunk";
      events.push("stream:throw");
      throw new Error("stream failed");
    });

    const iterator = stream[Symbol.asyncIterator]();

    await expect(iterator.next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    const queuedRun = scheduler.run(async () => {
      events.push("run:start");
      return "run-result";
    });

    expect(events).toEqual(["stream:start"]);

    await expect(iterator.next()).rejects.toThrow("stream failed");
    await expect(queuedRun).resolves.toBe("run-result");

    expect(events).toEqual(["stream:start", "stream:throw", "run:start"]);
  });

  it("does not acquire a stream slot until iteration begins", async () => {
    const scheduler = new Scheduler();
    const events: string[] = [];

    const stream = scheduler.stream(async function* () {
      events.push("stream:start");
      yield "chunk";
    });

    const run = scheduler.run(async () => {
      events.push("run:start");
      return "run-result";
    });

    await expect(run).resolves.toBe("run-result");

    expect(events).toEqual(["run:start"]);

    await expect(stream[Symbol.asyncIterator]().next()).resolves.toEqual({
      value: "chunk",
      done: false,
    });

    expect(events).toEqual(["run:start", "stream:start"]);
  });
});

function expectEventually<T>(actual: () => T) {
  return expect.poll(actual, { interval: 1, timeout: 100 });
}
