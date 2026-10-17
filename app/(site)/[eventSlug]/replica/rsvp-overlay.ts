import type { Snapshot } from "@schellingboard/contracts/snapshot";

export type PendingRsvp = {
  id: number;
  guestId: string;
  sessionId: string;
  remove: boolean;
  /** The replica's count when the guest clicked, to tell the echo from "not yet". */
  baseCount: number;
  /** The replica already held the target state, so no count change follows. */
  noop: boolean;
  acknowledged: boolean;
  acknowledgedAt?: number;
  clickSeq?: number;
};

const holds = (replica: Snapshot, op: PendingRsvp) =>
  replica.me?.rsvps.some((r) => r.sessionId === op.sessionId) ?? false;

const forViewer = (replica: Snapshot, op: PendingRsvp) =>
  replica.me?.guestId === op.guestId;

/**
 * The pending toggles the replica has not caught up with. A toggle is done
 * once the feed carries its RSVP and its count (or the server answered a
 * toggle that changed nothing); a later toggle of the same session waits for
 * the earlier one.
 */
export function settlePendingRsvps(
  replica: Snapshot,
  pending: PendingRsvp[]
): PendingRsvp[] {
  const waiting = new Set<string>();
  const kept = pending.filter((op) => {
    const done =
      !waiting.has(op.sessionId) &&
      (!forViewer(replica, op) ||
        (holds(replica, op) !== op.remove &&
          ((op.acknowledged && op.noop) ||
            replica.counts[op.sessionId] !== op.baseCount)));
    if (!done) waiting.add(op.sessionId);
    return !done;
  });
  return kept.length === pending.length ? pending : kept;
}

export const ACKNOWLEDGED_EXPIRY_MS = 3000;

export function nextExpiryAt(
  pending: PendingRsvp[],
  seq: number
): number | null {
  const times = pending.flatMap((op) =>
    op.acknowledgedAt !== undefined &&
    op.clickSeq !== undefined &&
    seq > op.clickSeq
      ? [op.acknowledgedAt + ACKNOWLEDGED_EXPIRY_MS]
      : []
  );
  return times.length === 0 ? null : Math.min(...times);
}

export function dropFrom(
  pending: PendingRsvp[],
  id: number,
  sessionId: string
): PendingRsvp[] {
  return pending.filter((op) => op.id < id || op.sessionId !== sessionId);
}

/**
 * The replica can skip the states a toggle settles on, so an answered one
 * expires. Only once the feed has delivered something since the click: a
 * stream that is slow or reconnecting keeps the optimistic state.
 */
export function expirePendingRsvps(
  pending: PendingRsvp[],
  now: number,
  seq: number
): PendingRsvp[] {
  const kept = pending.filter(
    (op) =>
      op.acknowledgedAt === undefined ||
      op.clickSeq === undefined ||
      seq <= op.clickSeq ||
      now - op.acknowledgedAt < ACKNOWLEDGED_EXPIRY_MS
  );
  return kept.length === pending.length ? pending : kept;
}

export function withPendingRsvps(
  replica: Snapshot,
  pending: PendingRsvp[]
): Snapshot {
  const { me } = replica;
  const mine = pending.filter((op) => forViewer(replica, op));
  if (!me || mine.length === 0) return replica;

  let rsvps = me.rsvps;
  const deltas = new Map<string, { base: number; delta: number }>();
  for (const op of mine) {
    rsvps = op.remove
      ? rsvps.filter((r) => r.sessionId !== op.sessionId)
      : [
          ...rsvps.filter((r) => r.sessionId !== op.sessionId),
          { id: "", guestId: op.guestId, sessionId: op.sessionId },
        ];
    if (op.noop && !deltas.has(op.sessionId)) continue;
    const entry = deltas.get(op.sessionId) ?? {
      base: op.baseCount,
      delta: 0,
    };
    entry.delta += op.remove ? -1 : 1;
    deltas.set(op.sessionId, entry);
  }

  const counts = { ...replica.counts };
  for (const [sessionId, { base, delta }] of deltas) {
    if (sessionId in counts && counts[sessionId] === base)
      counts[sessionId] = base + delta;
  }
  return { ...replica, me: { ...me, rsvps }, counts };
}
