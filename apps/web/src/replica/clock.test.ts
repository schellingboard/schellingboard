// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import { connectFeed } from "./feed-client";
import { createReplicaStore } from "./store";
import { snapshot } from "./snapshot-fixture";

const SERVER = Date.parse(snapshot.now);

describe("the server clock", () => {
  it("is the snapshot's now on a device whose clock is the same", () => {
    const store = createReplicaStore(snapshot, undefined, () => SERVER);

    expect(store.serverNow()).toBe(SERVER);
  });

  it("runs ahead of a device clock that is behind, and keeps moving with it", () => {
    let local = SERVER - 3_600_000;
    const store = createReplicaStore(snapshot, undefined, () => local);

    local += 5_000;

    expect(store.serverNow()).toBe(SERVER + 5_000);
  });

  it("is corrected by a snapshot that replaces the replica", () => {
    const store = createReplicaStore(snapshot, undefined, () => SERVER);

    store.replace({
      ...snapshot,
      now: new Date(SERVER + 60_000).toISOString(),
    });

    expect(store.serverNow()).toBe(SERVER + 60_000);
  });

  it("is corrected by a newer snapshot adopted into the replica", () => {
    const store = createReplicaStore(snapshot, undefined, () => SERVER);

    store.adopt({ ...snapshot, now: new Date(SERVER + 60_000).toISOString() });

    expect(store.serverNow()).toBe(SERVER + 60_000);
  });

  it("is corrected by the feed's ping, so a long-open tab does not drift", () => {
    const listeners = new Map<string, (e: { data: string }) => void>();
    let local = SERVER;
    const store = createReplicaStore(snapshot, undefined, () => local);
    connectFeed({
      slug: "my-event",
      store,
      loadSnapshot: () => Promise.resolve(snapshot),
      createSource: () => ({
        addEventListener: (type, listener) =>
          void listeners.set(type, listener),
        close: () => {},
        readyState: 1,
      }),
    });

    local += 600_000;
    listeners.get("ping")?.({
      data: JSON.stringify({ now: new Date(SERVER + 601_000).toISOString() }),
    });

    expect(store.serverNow()).toBe(SERVER + 601_000);
  });

  it("ignores a ping that carries no time", () => {
    const listeners = new Map<string, (e: { data: string }) => void>();
    const store = createReplicaStore(snapshot, undefined, () => SERVER);
    connectFeed({
      slug: "my-event",
      store,
      loadSnapshot: () => Promise.resolve(snapshot),
      createSource: () => ({
        addEventListener: (type, listener) =>
          void listeners.set(type, listener),
        close: () => {},
        readyState: 1,
      }),
    });

    listeners.get("ping")?.({ data: "{}" });

    expect(store.serverNow()).toBe(SERVER);
  });
});
