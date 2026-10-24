// @module-tag 007-US8
import { describe, it, expect, vi, afterEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { createReplicaPersistence } from "./persistence";
import { autosaveReplica, openReplica } from "./open-replica";
import { connectFeed } from "./feed-client";
import { createReplicaStore } from "./store";
import { syncState } from "./sync-state";
import { snapshot } from "./snapshot-fixture";

afterEach(() => vi.useRealTimers());

const guestId = snapshot.me!.guestId;

describe("opening a replica", () => {
  it("loads a snapshot when nothing is persisted, and starts live", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    const loadSnapshot = vi.fn().mockResolvedValue(snapshot);

    const { store, persisted } = await openReplica({
      slug: "conf",
      viewer: guestId,
      persistence,
      loadSnapshot,
    });

    expect(persisted).toBe(false);
    expect(store.get()).toEqual(snapshot);
    expect(syncState(store.link(), performance.now())).toBe("live");
  });

  it("opens a persisted replica at once as stale, to resume the feed from its seq", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save({ ...snapshot, seq: 31 });
    const loadSnapshot = vi.fn();

    const { store, persisted } = await openReplica({
      slug: "conf",
      viewer: guestId,
      persistence,
      loadSnapshot,
    });

    expect(persisted).toBe(true);
    expect(loadSnapshot).not.toHaveBeenCalled();
    expect(store.get().seq).toBe(31);
    expect(syncState(store.link(), performance.now())).toBe("stale");
  });

  it("goes live again once the feed connects", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);
    const { store } = await openReplica({
      slug: "conf",
      viewer: guestId,
      persistence,
      loadSnapshot: vi.fn(),
    });

    store.linkUp();

    expect(syncState(store.link(), performance.now())).toBe("live");
  });

  it("does not take the server's time from a snapshot saved earlier", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);
    const local = Date.parse(snapshot.now) + 86_400_000;
    const { store } = await openReplica({
      slug: "conf",
      viewer: guestId,
      persistence,
      loadSnapshot: vi.fn(),
      wallClock: () => local,
    });

    expect(store.serverNow()).toBe(local);
  });

  it("removes a signed-out guest's private copy even when nothing new is saved", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);

    await openReplica({
      slug: "conf",
      viewer: null,
      persistence,
      loadSnapshot: vi.fn().mockResolvedValue({ ...snapshot, me: null }),
    });

    expect(await persistence.load("conf", guestId)).toBeNull();
  });

  it("resumes the feed from the persisted seq, and reloads on a reset", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save({ ...snapshot, seq: 31 });
    const { store } = await openReplica({
      slug: "conf",
      viewer: guestId,
      persistence,
      loadSnapshot: vi.fn(),
    });
    const sources: { url: string; emit: (type: string) => void }[] = [];
    const fresh = { ...snapshot, seq: 90 };
    connectFeed({
      slug: "conf",
      store,
      loadSnapshot: () => Promise.resolve(fresh),
      createSource: (url) => {
        const listeners = new Map<string, (e: { data: string }) => void>();
        const source = {
          url,
          readyState: 1,
          addEventListener: (type: string, l: (e: { data: string }) => void) =>
            void listeners.set(type, l),
          close: () => {},
          emit: (type: string) => listeners.get(type)?.({ data: "{}" }),
        };
        sources.push(source);
        return source;
      },
    });

    expect(sources[0].url).toBe("/api/v1/events/conf/feed?since=31");
    sources[0].emit("open");
    expect(syncState(store.link(), performance.now())).toBe("live");
    sources[0].emit("reset");
    await vi.waitFor(() => expect(store.get().seq).toBe(90));
  });

  it("starts from the network when the persisted copy belongs to another viewer", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);
    const loadSnapshot = vi.fn().mockResolvedValue({ ...snapshot, me: null });

    const { persisted } = await openReplica({
      slug: "conf",
      viewer: null,
      persistence,
      loadSnapshot,
    });

    expect(persisted).toBe(false);
    expect(loadSnapshot).toHaveBeenCalled();
  });
});

describe("saving the replica", () => {
  it("saves a change after a short pause, once for a burst of changes", async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    const store = createReplicaStore(snapshot);
    autosaveReplica(store, { save });

    store.replace({ ...snapshot, seq: 8 });
    store.replace({ ...snapshot, seq: 9 });
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1_000);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ seq: 9 }));
  });

  it("saves a replica fresh from the network without waiting for a change", async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    const store = createReplicaStore(snapshot);
    autosaveReplica(store, { save }, { fresh: true });

    await vi.advanceTimersByTimeAsync(1_000);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ seq: 7 }));
  });

  it("does not save a replica that has not changed, or after it is stopped", async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    const store = createReplicaStore(snapshot);
    const stop = autosaveReplica(store, { save });

    store.linkDown();
    await vi.advanceTimersByTimeAsync(1_000);
    store.replace({ ...snapshot, seq: 8 });
    stop();
    await vi.advanceTimersByTimeAsync(1_000);

    expect(save).not.toHaveBeenCalled();
  });
});
