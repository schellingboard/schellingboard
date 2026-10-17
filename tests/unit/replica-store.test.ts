// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import { createReplicaStore } from "@/app/(site)/[eventSlug]/replica/store";
import { snapshot } from "../helpers/snapshot-fixture";

describe("replica store", () => {
  it("replace swaps the replica, even for a lower seq, and notifies", () => {
    const store = createReplicaStore(snapshot);
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);

    store.replace({ ...snapshot, seq: 1 });
    unsubscribe();
    store.replace({ ...snapshot, seq: 2 });

    expect(store.get().seq).toBe(2);
    expect(calls).toBe(1);
  });

  it("knows the event is gone once it is deleted, until a snapshot replaces it", () => {
    const store = createReplicaStore(snapshot);
    let calls = 0;
    store.subscribe(() => calls++);

    store.applyMessage({
      seq: snapshot.seq + 1,
      type: "event.deleted",
      commandKey: null,
    });

    expect(store.gone()).toBe(true);
    expect(calls).toBe(1);
    store.replace(snapshot);
    expect(store.gone()).toBe(false);
  });

  it("adopt takes a seed at or above the replica's seq, never a lower one", () => {
    const store = createReplicaStore({ ...snapshot, seq: 10 });

    store.adopt({ ...snapshot, seq: 9 });
    expect(store.get().seq).toBe(10);
    store.adopt({ ...snapshot, seq: 11 });
    expect(store.get().seq).toBe(11);
  });
});
