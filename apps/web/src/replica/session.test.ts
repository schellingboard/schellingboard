// @module-tag 007-US8
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { createReplicaPersistence } from "./persistence";
import { startReplicaSession } from "./session";
import { snapshot } from "./snapshot-fixture";

class FakeSource {
  closed = false;
  readyState = 1;
  constructor(readonly url: string) {}
  addEventListener() {}
  close() {
    this.closed = true;
  }
}

function setup(seq = 7) {
  const sources: FakeSource[] = [];
  const doc = new EventTarget() as EventTarget & { visibilityState: string };
  doc.visibilityState = "visible";
  const win = new EventTarget();
  const persistence = createReplicaPersistence(new IDBFactory());
  const start = () =>
    startReplicaSession({
      slug: "conf",
      viewer: "mia",
      persistence,
      loadSnapshot: () => Promise.resolve({ ...snapshot, seq }),
      createSource: (url) => {
        const source = new FakeSource(url);
        sources.push(source);
        return source;
      },
      doc,
      win,
    });
  return { sources, doc, win, start, persistence };
}

beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] }));
afterEach(() => vi.useRealTimers());

describe("a replica session", () => {
  it("loads the event and follows its feed from the snapshot's seq", async () => {
    const { sources, start } = setup(12);
    const session = await start();
    expect(session.store.get().seq).toBe(12);
    expect(sources.map((s) => s.url)).toEqual([
      "/api/v1/events/conf/feed?since=12",
    ]);
    session.stop();
  });

  it("saves changes to the device shortly after, for the next visit", async () => {
    const { start, persistence } = setup();
    const session = await start();
    session.store.applyMessage({
      seq: 8,
      type: "event.deleted",
      commandKey: null,
    });
    await vi.advanceTimersByTimeAsync(1100);
    expect((await persistence.load("conf", "mia"))?.seq).toBe(8);
    session.stop();
  });

  it("resumes from a persisted copy without asking the network", async () => {
    const { sources, start, persistence } = setup();
    await persistence.save({ ...snapshot, seq: 31 });
    const session = await start();
    expect(session.persisted).toBe(true);
    expect(sources[0].url).toBe("/api/v1/events/conf/feed?since=31");
    session.stop();
  });

  it("closes the stream when stopped", async () => {
    const { sources, start } = setup();
    const session = await start();
    session.stop();
    expect(sources[0].closed).toBe(true);
  });

  it("drops the stream of a tab hidden for a while and reopens it on return", async () => {
    const { sources, doc, start } = setup();
    const session = await start();
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(29_000);
    expect(sources[0].closed).toBe(false);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(sources[0].closed).toBe(true);
    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(sources).toHaveLength(2);
    session.stop();
  });

  it("keeps the stream through a short switch away", async () => {
    const { sources, doc, start } = setup();
    const session = await start();
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(5_000);
    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(sources).toHaveLength(1);
    expect(sources[0].closed).toBe(false);
    session.stop();
  });

  it("closes the stream as the page goes to the back/forward cache and reloads on return", async () => {
    const { sources, win, start } = setup();
    const session = await start();
    win.dispatchEvent(new Event("pagehide"));
    expect(sources[0].closed).toBe(true);
    win.dispatchEvent(
      Object.assign(new Event("pageshow"), { persisted: true })
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(sources.length).toBeGreaterThan(1);
    session.stop();
  });
});
