import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { apply } from "./apply";

export type ReplicaStore = ReturnType<typeof createReplicaStore>;

export function createReplicaStore(initial: Snapshot) {
  let replica = initial;
  const listeners = new Set<() => void>();
  const set = (next: Snapshot) => {
    if (next === replica) return;
    replica = next;
    listeners.forEach((listener) => listener());
  };
  return {
    get: () => replica,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    applyMessage: (message: FeedMessage) => set(apply(replica, message)),
    replace: set,
  };
}
