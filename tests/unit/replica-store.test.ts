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
});
