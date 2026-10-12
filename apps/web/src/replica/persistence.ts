import {
  snapshotSchema,
  type Snapshot,
} from "@schellingboard/contracts/snapshot";

export const REPLICA_DB = "schellingboard-replica";
export const REPLICA_STORE = "replicas";

export type ReplicaPersistence = ReturnType<typeof createReplicaPersistence>;

const keyOf = (slug: string, viewer: string | null) =>
  `${slug}\u0000${viewer === null ? "anonymous" : `guest:${viewer}`}`;

const settled = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });

const finished = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () =>
      reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });

/**
 * One snapshot per (event, viewer). Saving a viewer's copy drops the event's
 * other copies, so a user switch leaves no private data of the previous user.
 * IndexedDB can be missing or refuse (private windows): losing the copy only
 * costs a network load, so every failure reads as absent.
 */
export function createReplicaPersistence(
  idb: IDBFactory = globalThis.indexedDB
) {
  let opened: Promise<IDBDatabase> | undefined;
  const database = () =>
    (opened ??= (async () => {
      const request = idb.open(REPLICA_DB, 1);
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore(REPLICA_STORE, {
          keyPath: "key",
        });
        store.createIndex("slug", "slug");
      };
      const db = await settled(request);
      db.onversionchange = () => {
        db.close();
        opened = undefined;
      };
      return db;
    })());

  return {
    async load(slug: string, viewer: string | null): Promise<Snapshot | null> {
      try {
        const db = await database();
        const record = (await settled<unknown>(
          db
            .transaction(REPLICA_STORE)
            .objectStore(REPLICA_STORE)
            .get(keyOf(slug, viewer))
        )) as { snapshot: unknown } | undefined;
        const parsed = snapshotSchema.safeParse(record?.snapshot);
        // The key says whose copy this is; the data must agree before it is shown.
        return parsed.success && (parsed.data.me?.guestId ?? null) === viewer
          ? parsed.data
          : null;
      } catch {
        opened = undefined;
        return null;
      }
    },
    async discardOthers(slug: string, viewer: string | null): Promise<void> {
      try {
        const db = await database();
        const tx = db.transaction(REPLICA_STORE, "readwrite");
        const store = tx.objectStore(REPLICA_STORE);
        const keep = keyOf(slug, viewer);
        const keys = await settled(store.index("slug").getAllKeys(slug));
        for (const other of keys) if (other !== keep) store.delete(other);
        await finished(tx);
      } catch {
        opened = undefined;
      }
    },
    async save(snapshot: Snapshot): Promise<void> {
      try {
        const db = await database();
        const slug = snapshot.event.slug;
        const key = keyOf(slug, snapshot.me?.guestId ?? null);
        const tx = db.transaction(REPLICA_STORE, "readwrite");
        const store = tx.objectStore(REPLICA_STORE);
        const keys = await settled(store.index("slug").getAllKeys(slug));
        for (const other of keys) if (other !== key) store.delete(other);
        store.put({ key, slug, snapshot });
        await finished(tx);
      } catch {
        opened = undefined;
      }
    },
  };
}
