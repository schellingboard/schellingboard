import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { ReplicaPersistence } from "./persistence";
import { createReplicaStore, type ReplicaStore } from "./store";

const SAVE_AFTER_MS = 1_000;

/**
 * The replica to show first: the persisted copy of this viewer's event, stale
 * until the feed resumes from its `seq`, or else a snapshot from the network.
 * `viewer` must be the guest the feed will be opened for; other viewers' copies
 * of the event are discarded, so a signed-out guest's data does not linger.
 */
export async function openReplica({
  slug,
  viewer,
  persistence,
  loadSnapshot,
  wallClock,
}: {
  slug: string;
  viewer: string | null;
  persistence: Pick<ReplicaPersistence, "load" | "discardOthers">;
  loadSnapshot: () => Promise<Snapshot>;
  wallClock?: () => number;
}): Promise<{ store: ReplicaStore; persisted: boolean }> {
  await persistence.discardOthers(slug, viewer);
  const saved = await persistence.load(slug, viewer);
  if (saved)
    return {
      store: createReplicaStore(saved, undefined, wallClock, {
        persisted: true,
      }),
      persisted: true,
    };
  return {
    store: createReplicaStore(await loadSnapshot(), undefined, wallClock),
    persisted: false,
  };
}

/**
 * Saves the replica shortly after it last changed; returns the stopper. A
 * `fresh` replica came from the network and has nothing saved yet, so it is
 * saved even if it never changes.
 */
export function autosaveReplica(
  store: ReplicaStore,
  persistence: Pick<ReplicaPersistence, "save">,
  { fresh = false }: { fresh?: boolean } = {}
) {
  let last = store.get();
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (fresh)
    timer = setTimeout(() => void persistence.save(last), SAVE_AFTER_MS);
  const unsubscribe = store.subscribe(() => {
    if (store.get() === last) return;
    last = store.get();
    clearTimeout(timer);
    timer = setTimeout(() => void persistence.save(last), SAVE_AFTER_MS);
  });
  return () => {
    unsubscribe();
    clearTimeout(timer);
  };
}
