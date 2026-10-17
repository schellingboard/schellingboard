import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { apply } from "./apply";

export type ReplicaStore = ReturnType<typeof createReplicaStore>;

export function createReplicaStore(initial: Snapshot) {
  let replica = initial;
  let gone = false;
  let meetingsRevision = 0;
  const listeners = new Set<() => void>();
  const set = (next: Snapshot, nextGone: boolean, revise = true) => {
    if (next === replica && nextGone === gone) return;
    if (
      revise &&
      (next.sessions !== replica.sessions ||
        next.me?.rsvps !== replica.me?.rsvps ||
        next.me?.meetings !== replica.me?.meetings)
    )
      meetingsRevision++;
    replica = next;
    gone = nextGone;
    listeners.forEach((listener) => listener());
  };
  return {
    get: () => replica,
    gone: () => gone,
    // What a meeting's clash lines are computed from, which the replica does
    // not hold (ADR 0014 section 4).
    meetingsRevision: () => meetingsRevision,
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
      if (next.seq >= replica.seq) set(next, false, false);
    },
  };
}
