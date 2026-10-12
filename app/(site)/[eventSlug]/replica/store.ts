import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { apply } from "./apply";
import type { Link } from "./sync-state";

export type ReplicaStore = ReturnType<typeof createReplicaStore>;

export function createReplicaStore(
  initial: Snapshot,
  clock: () => number = () => performance.now()
) {
  let replica = initial;
  let gone = false;
  let meetingsRevision = 0;
  // The seed is fresh from the server, so the replica starts out connected.
  let link: Link = { connected: true, since: clock() };
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
  const setLink = (next: Link) => {
    if (next.connected === link.connected && next.since === link.since) return;
    link = next;
    listeners.forEach((listener) => listener());
  };
  return {
    get: () => replica,
    gone: () => gone,
    // What a meeting's clash lines are computed from, which the replica does
    // not hold (ADR 0014 section 4).
    meetingsRevision: () => meetingsRevision,
    link: () => link,
    linkUp: () =>
      setLink(link.connected ? link : { connected: true, since: clock() }),
    // Repeated drops keep the time the first one began, so staleness counts
    // from then.
    linkDown: () =>
      setLink(link.connected ? { connected: false, since: clock() } : link),
    linkRestart: () => setLink({ connected: false, since: clock() }),
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
