// @module-tag 007-US8
import { describe, it, expect, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import {
  createReplicaPersistence,
  REPLICA_DB,
  REPLICA_STORE,
} from "./persistence";
import { snapshot } from "./snapshot-fixture";

const anonymous: Snapshot = { ...snapshot, me: null };
const otherEvent: Snapshot = {
  ...snapshot,
  event: { ...snapshot.event, slug: "other" },
};
const guestId = snapshot.me!.guestId;

async function overwrite(idb: IDBFactory, broken: unknown) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = idb.open(REPLICA_DB);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
  const store = db
    .transaction(REPLICA_STORE, "readwrite")
    .objectStore(REPLICA_STORE);
  const keys = await new Promise<IDBValidKey[]>((resolve) => {
    const request = store.getAllKeys();
    request.onsuccess = () => resolve(request.result);
  });
  await new Promise((resolve) => {
    const request = store.put({ key: keys[0], slug: "conf", snapshot: broken });
    request.onsuccess = resolve;
  });
  db.close();
}

describe("replica persistence", () => {
  it("returns what was saved for the same event and viewer", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());

    await persistence.save(snapshot);

    expect(await persistence.load("conf", guestId)).toEqual(snapshot);
  });

  it("keeps a signed-in viewer's copy apart from the anonymous one", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());

    await persistence.save(anonymous);

    expect(await persistence.load("conf", null)).toEqual(anonymous);
    expect(await persistence.load("conf", guestId)).toBeNull();
  });

  it("drops the other viewers' copies of the event when a viewer saves", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);
    await persistence.save(otherEvent);

    await persistence.save(anonymous);

    expect(await persistence.load("conf", guestId)).toBeNull();
    expect(await persistence.load("conf", null)).toEqual(anonymous);
    expect(await persistence.load("other", guestId)).toEqual(otherEvent);
  });

  it("treats a record that no longer matches the contract as absent", async () => {
    const idb = new IDBFactory();
    const persistence = createReplicaPersistence(idb);
    await persistence.save(snapshot);
    await overwrite(idb, { ...snapshot, seq: "not a number" });

    expect(await persistence.load("conf", guestId)).toBeNull();
  });

  it("does not return a copy whose viewer is not the one asked for", async () => {
    const idb = new IDBFactory();
    const persistence = createReplicaPersistence(idb);
    await persistence.save(snapshot);
    await overwrite(idb, anonymous);

    expect(await persistence.load("conf", guestId)).toBeNull();
  });

  it("discards the event's copies of everyone but the viewer", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);
    await persistence.save(otherEvent);

    await persistence.discardOthers("conf", null);

    expect(await persistence.load("conf", guestId)).toBeNull();
    expect(await persistence.load("other", guestId)).toEqual(otherEvent);
  });

  it("clears every copy on this device", async () => {
    const persistence = createReplicaPersistence(new IDBFactory());
    await persistence.save(snapshot);
    await persistence.save(otherEvent);

    await persistence.clear();

    expect(await persistence.load("conf", guestId)).toBeNull();
    expect(await persistence.load("other", guestId)).toBeNull();
  });

  it("works without IndexedDB, as a private window may refuse it", async () => {
    const idb = new IDBFactory();
    vi.spyOn(idb, "open").mockImplementation(() => {
      throw new Error("blocked");
    });
    const persistence = createReplicaPersistence(idb);

    await expect(persistence.save(snapshot)).resolves.toBeUndefined();
    expect(await persistence.load("conf", guestId)).toBeNull();
  });
});
