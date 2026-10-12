// @module-tag 007-US8
import { describe, it, expect, vi } from "vitest";
import { feedMessageSchema } from "@schellingboard/contracts/feed";
import type { FeedMessage } from "@schellingboard/contracts/feed";
import {
  connectFeed,
  SILENCE_MS,
} from "@/app/(site)/[eventSlug]/replica/feed-client";
import { createReplicaStore } from "@/app/(site)/[eventSlug]/replica/store";
import { snapshot } from "../helpers/snapshot-fixture";

type Listener = (event: { data: string }) => void;

class FakeSource {
  closed = false;
  readyState = 1;
  listeners = new Map<string, Listener>();
  constructor(readonly url: string) {}
  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, listener);
  }
  close() {
    this.closed = true;
  }
  emit(type: string, data: unknown) {
    this.listeners.get(type)?.({ data: JSON.stringify(data) });
  }
}

const renamed = (seq: number, title: string): FeedMessage => ({
  seq,
  type: "session.changed",
  commandKey: null,
  session: { ...snapshot.sessions[0], title },
});

function setup(
  loadSnapshot: () => Promise<typeof snapshot> = () =>
    Promise.resolve({ ...snapshot, seq: 40 }),
  resume = true
) {
  const store = createReplicaStore(snapshot);
  const sources: FakeSource[] = [];
  const feed = connectFeed({
    slug: "my-event",
    store,
    loadSnapshot,
    delay: () => Promise.resolve(),
    resume,
    createSource: (url) => {
      const source = new FakeSource(url);
      sources.push(source);
      return source;
    },
  });
  return { store, sources, feed };
}

describe("connectFeed", () => {
  it("opens the feed after the replica's seq and applies each message", () => {
    const { store, sources } = setup();

    expect(sources[0].url).toBe(
      `/api/v1/events/my-event/feed?since=${snapshot.seq}`
    );
    sources[0].emit("session.changed", renamed(snapshot.seq + 1, "Live"));

    expect(store.get().sessions[0].title).toBe("Live");
    expect(store.get().seq).toBe(snapshot.seq + 1);
  });

  it("tells subscribers once per applied message, not for a repeat", () => {
    const { store, sources } = setup();
    let calls = 0;
    store.subscribe(() => calls++);
    const message = renamed(snapshot.seq + 1, "Live");

    sources[0].emit("session.changed", message);
    sources[0].emit("session.changed", message);

    expect(calls).toBe(1);
  });

  it("ignores data that is not a feed message", () => {
    const { store, sources } = setup();

    sources[0].emit("session.changed", { seq: 99, type: "nonsense" });
    sources[0].listeners.get("session.changed")?.({ data: "{not json" });

    expect(store.get()).toBe(snapshot);
  });

  it("loads the snapshot again on reset and resumes after its seq", async () => {
    const { store, sources } = setup();

    sources[0].emit("reset", {});
    await vi.waitFor(() => expect(sources).toHaveLength(2));

    expect(sources[0].closed).toBe(true);
    expect(store.get().seq).toBe(40);
    expect(sources[1].url).toBe("/api/v1/events/my-event/feed?since=40");
  });

  it("listens for every message type, ping, reset, error and open", () => {
    const { sources } = setup();

    const types = feedMessageSchema.options.map((o) => o.shape.type.value);
    expect([...sources[0].listeners.keys()].sort()).toEqual(
      [...types, "ping", "reset", "error", "open"].sort()
    );
  });

  it("opens nothing after close, even when a reload was in flight", async () => {
    let finish: (s: typeof snapshot) => void = () => {};
    const { sources, feed } = setup(
      () => new Promise((resolve) => (finish = resolve))
    );

    sources[0].emit("reset", {});
    feed.close();
    finish({ ...snapshot, seq: 40 });
    await Promise.resolve();
    await Promise.resolve();

    expect(sources).toHaveLength(1);
    expect(sources[0].closed).toBe(true);
  });

  it("retries a failed snapshot load until it succeeds", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ ...snapshot, seq: 40 });
    const { store, sources } = setup(load);

    sources[0].emit("reset", {});
    await vi.waitFor(() => expect(sources).toHaveLength(2));

    expect(load).toHaveBeenCalledTimes(2);
    expect(store.get().seq).toBe(40);
  });

  it("reloads once for a second reset, and ignores a stale source's", async () => {
    const load = vi.fn(() => Promise.resolve({ ...snapshot, seq: 40 }));
    const { sources } = setup(load);

    sources[0].emit("reset", {});
    sources[0].emit("reset", {});
    await vi.waitFor(() => expect(sources).toHaveLength(2));
    sources[0].emit("reset", {});
    await Promise.resolve();

    expect(load).toHaveBeenCalledTimes(1);
    expect(sources).toHaveLength(2);
    expect(sources[0].closed).toBe(true);
    expect(sources[1].closed).toBe(false);
  });

  it("close is safe to call twice", () => {
    const { feed } = setup();

    feed.close();
    expect(() => feed.close()).not.toThrow();
  });

  it("starts from a fresh snapshot instead of resuming when asked", async () => {
    const { store, sources } = setup(undefined, false);

    expect(sources).toHaveLength(0);
    await vi.waitFor(() => expect(sources).toHaveLength(1));

    expect(store.get().seq).toBe(40);
    expect(sources[0].url).toBe("/api/v1/events/my-event/feed?since=40");
  });

  it("reloads the snapshot when the source closes for good, and ignores a reconnecting error", async () => {
    const { store, sources } = setup();

    sources[0].emit("error", {});
    expect(sources).toHaveLength(1);
    sources[0].readyState = 2;
    sources[0].emit("error", {});
    await vi.waitFor(() => expect(sources).toHaveLength(2));

    expect(store.get().seq).toBe(40);
    expect(sources[1].url).toContain("since=40");
  });

  it("backs off while the snapshot cannot be loaded", async () => {
    const delays: number[] = [];
    const load = vi.fn(() => Promise.reject(new Error("404")));
    const sources: FakeSource[] = [];
    connectFeed({
      slug: "my-event",
      store: createReplicaStore(snapshot),
      loadSnapshot: load,
      delay: (ms) => {
        delays.push(ms);
        return delays.length < 4 ? Promise.resolve() : new Promise(() => {});
      },
      createSource: (url) => {
        const source = new FakeSource(url);
        sources.push(source);
        return source;
      },
    });
    sources[0].readyState = 2;
    sources[0].emit("error", {});
    await vi.waitFor(() => expect(delays.length).toBe(4));

    expect(delays[1]).toBeGreaterThan(delays[0]);
    expect(delays[3]).toBeGreaterThan(delays[1]);
  });

  it("keeps backing off when the snapshot loads but the stream is refused again", async () => {
    const delays: number[] = [];
    const sources: FakeSource[] = [];
    connectFeed({
      slug: "my-event",
      store: createReplicaStore(snapshot),
      loadSnapshot: () => Promise.resolve({ ...snapshot, seq: 40 }),
      delay: (ms) => {
        delays.push(ms);
        return delays.length < 3 ? Promise.resolve() : new Promise(() => {});
      },
      createSource: (url) => {
        const source = new FakeSource(url);
        source.readyState = 2;
        sources.push(source);
        queueMicrotask(() => source.emit("error", {}));
        return source;
      },
    });
    await vi.waitFor(() => expect(delays).toHaveLength(3));

    expect(delays[2]).toBeGreaterThan(delays[0]);
  });

  it("finishes a reload that a hide cut short once the tab is back", async () => {
    let fail = true;
    const synced = vi.fn();
    const store = createReplicaStore(snapshot);
    const sources: FakeSource[] = [];
    const gate: { release: (() => void) | null } = { release: null };
    let delays = 0;
    const feed = connectFeed({
      slug: "my-event",
      store,
      resume: false,
      onSynced: synced,
      loadSnapshot: () =>
        fail
          ? Promise.reject(new Error("down"))
          : Promise.resolve({ ...snapshot, seq: 40 }),
      delay: () =>
        ++delays > 1
          ? Promise.resolve()
          : new Promise<void>((resolve) => (gate.release = resolve)),
      createSource: (url) => {
        const source = new FakeSource(url);
        sources.push(source);
        return source;
      },
    });
    await vi.waitFor(() => expect(gate.release).not.toBeNull());
    feed.stop();
    gate.release?.();
    await new Promise((r) => setTimeout(r, 0));
    fail = false;
    feed.resume();

    await vi.waitFor(() => expect(synced).toHaveBeenCalled());
    expect(store.get().seq).toBe(40);
    expect(sources[0].url).toContain("since=40");
  });

  it("is connected once the stream opens, down on an error, connected again on reopen", () => {
    const { store, sources } = setup();

    sources[0].emit("error", {});
    expect(store.link().connected).toBe(false);
    sources[0].emit("open", {});
    expect(store.link().connected).toBe(true);
  });

  it("is down after stop, and again after resume until the stream opens", () => {
    const { store, sources, feed } = setup();
    sources[0].emit("open", {});

    feed.stop();
    expect(store.link().connected).toBe(false);
    feed.resume();
    expect(store.link().connected).toBe(false);
    sources[1].emit("open", {});
    expect(store.link().connected).toBe(true);
  });

  describe("silence", () => {
    it("drops the link and reopens when nothing, not even a ping, arrives in time", () => {
      vi.useFakeTimers();
      try {
        const { store, sources } = setup();
        sources[0].emit("open", {});

        vi.advanceTimersByTime(SILENCE_MS - 1);
        sources[0].emit("ping", {});
        vi.advanceTimersByTime(SILENCE_MS - 1);
        expect(store.link().connected).toBe(true);
        expect(sources).toHaveLength(1);

        vi.advanceTimersByTime(1);
        expect(store.link().connected).toBe(false);
        expect(sources).toHaveLength(2);
        expect(sources[0].closed).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it("goes down and reopens when the first stream never sends anything", () => {
      vi.useFakeTimers();
      try {
        const { store, sources } = setup();

        vi.advanceTimersByTime(SILENCE_MS);

        expect(store.link().connected).toBe(false);
        expect(sources).toHaveLength(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it("leaves the browser's own retry alone after an error, but not a hung one", () => {
      vi.useFakeTimers();
      try {
        const { sources } = setup();
        sources[0].emit("open", {});

        sources[0].emit("error", {});
        vi.advanceTimersByTime(SILENCE_MS * 2);
        expect(sources).toHaveLength(1);

        vi.advanceTimersByTime(10_000);
        expect(sources).toHaveLength(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it("does not open a second source while the browser keeps retrying", () => {
      vi.useFakeTimers();
      try {
        const { sources } = setup();
        sources[0].emit("open", {});

        for (let i = 0; i < 40; i++) {
          sources[0].emit("error", {});
          vi.advanceTimersByTime(5_000);
        }

        expect(sources).toHaveLength(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it("ignores events from a source that was replaced", () => {
      vi.useFakeTimers();
      try {
        const { sources } = setup();
        vi.advanceTimersByTime(SILENCE_MS);
        expect(sources).toHaveLength(2);

        sources[0].emit("ping", {});
        vi.advanceTimersByTime(SILENCE_MS);

        expect(sources).toHaveLength(3);
      } finally {
        vi.useRealTimers();
      }
    });

    it("is not watched while stopped", () => {
      vi.useFakeTimers();
      try {
        const { sources, feed } = setup();
        sources[0].emit("open", {});

        feed.stop();
        vi.advanceTimersByTime(SILENCE_MS * 2);

        expect(sources).toHaveLength(1);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
