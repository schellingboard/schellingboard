import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { apply } from "@schellingboard/contracts/feed-apply";
import { STALE_AFTER_MS, type Link } from "./sync-state";

// A ping that agrees with the clock within this is network jitter, not news.
const CLOCK_SHIFT_MS = 1_000;

export type ReplicaStore = ReturnType<typeof createReplicaStore>;

export function createReplicaStore(
  initial: Snapshot,
  clock: () => number = () => performance.now(),
  wallClock: () => number = () => Date.now(),
  { persisted = false }: { persisted?: boolean } = {}
) {
  let replica = initial;
  let gone = false;
  let meetingsRevision = 0;
  // Measured at receipt, so it is off by the one-way latency; fine for minute-grained screens.
  let clockOffset = 0;
  const listeners = new Set<() => void>();
  const observeServerTime = (iso: string) => {
    const server = Date.parse(iso);
    if (Number.isNaN(server)) return;
    const shift = server - wallClock() - clockOffset;
    clockOffset += shift;
    if (Math.abs(shift) >= CLOCK_SHIFT_MS) listeners.forEach((l) => l());
  };
  if (!persisted) observeServerTime(initial.now);
  let deliveredKeys: ReadonlySet<string> = new Set();
  // A server seed is fresh, so the replica starts out connected; a persisted
  // copy is as old as its last save, so it starts out stale until the feed opens.
  let link: Link = persisted
    ? { connected: false, since: clock() - STALE_AFTER_MS }
    : { connected: true, since: clock() };
  const set = (
    next: Snapshot,
    nextGone: boolean,
    revise = true,
    attendance = false
  ) => {
    if (next === replica && nextGone === gone) return;
    if (
      revise &&
      (attendance ||
        next.sessions !== replica.sessions ||
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
    deliveredKeys: () => deliveredKeys,
    link: () => link,
    serverNow: () => wallClock() + clockOffset,
    clockOffset: () => clockOffset,
    observeServerTime,
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
    applyMessage: (message: FeedMessage) => {
      // An RSVP change ends with its count, so that message completes a key.
      if (
        message.commandKey !== null &&
        message.seq > replica.seq &&
        message.type === "session.attendanceChanged"
      )
        deliveredKeys = new Set([...deliveredKeys, message.commandKey]);
      set(
        apply(replica, message),
        gone || message.type === "event.deleted",
        true,
        // Other guests' RSVPs reach us only as a count, yet can start a clash.
        message.type === "session.attendanceChanged"
      );
    },
    replace: (next: Snapshot) => {
      deliveredKeys = new Set();
      observeServerTime(next.now);
      set(next, false);
    },
    // A server render can be older than what the feed already delivered. A
    // restored backup is not this case: the feed answers it with a reset, and
    // the reload goes through replace.
    adopt: (next: Snapshot) => {
      if (next.seq >= replica.seq) {
        observeServerTime(next.now);
        set(next, false, false);
      }
    },
  };
}
