// @module-tag 007-US8
import { describe, it, expect, vi } from "vitest";
import { feedMessageSchema } from "@schellingboard/contracts/feed";
import type { FeedMessage } from "@schellingboard/contracts/feed";
import { connectFeed } from "@/app/(site)/[eventSlug]/replica/feed-client";
import { createReplicaStore } from "@/app/(site)/[eventSlug]/replica/store";
import { snapshot } from "../helpers/snapshot-fixture";

type Listener = (event: { data: string }) => void;

class FakeSource {
  closed = false;
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
    Promise.resolve({ ...snapshot, seq: 40 })
) {
  const store = createReplicaStore(snapshot);
  const sources: FakeSource[] = [];
  const feed = connectFeed({
    slug: "my-event",
    store,
    loadSnapshot,
    delay: () => Promise.resolve(),
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

  it("listens for every message type and for reset", () => {
    const { sources } = setup();

    const types = feedMessageSchema.options.map((o) => o.shape.type.value);
    expect([...sources[0].listeners.keys()].sort()).toEqual(
      [...types, "reset"].sort()
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
});
