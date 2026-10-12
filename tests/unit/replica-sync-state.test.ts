// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import {
  STALE_AFTER_MS,
  staleAt,
  syncState,
} from "@/app/(site)/[eventSlug]/replica/sync-state";
import { createReplicaStore } from "@/app/(site)/[eventSlug]/replica/store";
import { snapshot } from "../helpers/snapshot-fixture";

describe("syncState", () => {
  it("is live while the feed is connected, however long ago it connected", () => {
    expect(syncState({ connected: true, since: 0 }, 10 * STALE_AFTER_MS)).toBe(
      "live"
    );
  });

  it("is reconnecting for a short while after the feed drops, then stale", () => {
    const link = { connected: false, since: 1000 };

    expect(syncState(link, 1000)).toBe("reconnecting");
    expect(syncState(link, 1000 + STALE_AFTER_MS - 1)).toBe("reconnecting");
    expect(syncState(link, 1000 + STALE_AFTER_MS)).toBe("stale");
    expect(staleAt(link)).toBe(1000 + STALE_AFTER_MS);
  });
});

describe("the store's link", () => {
  it("keeps the time a drop began through repeated drops, and resets it on a restart", () => {
    let clock = 100;
    const store = createReplicaStore(snapshot, () => clock);
    expect(store.link()).toEqual({ connected: true, since: 100 });

    clock = 200;
    store.linkDown();
    clock = 300;
    store.linkDown();
    expect(store.link()).toEqual({ connected: false, since: 200 });

    clock = 400;
    store.linkRestart();
    expect(store.link()).toEqual({ connected: false, since: 400 });
    store.linkUp();
    expect(store.link().connected).toBe(true);
  });

  it("notifies only when the link changes", () => {
    const store = createReplicaStore(snapshot);
    let calls = 0;
    store.subscribe(() => calls++);

    store.linkUp();
    store.linkDown();
    store.linkDown();

    expect(calls).toBe(1);
  });
});
