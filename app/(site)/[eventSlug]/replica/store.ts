import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { apply } from "./apply";

export type ReplicaStore = ReturnType<typeof createReplicaStore>;

export function createReplicaStore(initial: Snapshot) {
  let replica = initial;
  let gone = false;
  const listeners = new Set<() => void>();
  const set = (next: Snapshot, nextGone: boolean) => {
    if (next === replica && nextGone === gone) return;
    replica = next;
    gone = nextGone;
    listeners.forEach((listener) => listener());
  };
  return {
    get: () => replica,
    gone: () => gone,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    applyMessage: (message: FeedMessage) =>
      set(apply(replica, message), gone || message.type === "event.deleted"),
    replace: (next: Snapshot) => set(next, false),
    // A server render can be older than what the feed already delivered. A
    // restored backup is not this case: the feed answers it with a reset, and
    // the reload goes through replace.
    adopt: (next: Snapshot) => {
      if (next.seq >= replica.seq) set(next, false);
    },
  };
}
