export type SyncState = "live" | "reconnecting" | "stale";
export type Link = { connected: boolean; since: number };

export const STALE_AFTER_MS = 15_000;

// The server ends each stream on purpose and tells the browser to reconnect
// after 1 s (`retry:`); that gap must not flash "Reconnecting…".
export const RECONNECT_GRACE_MS = 2_000;

export const staleAt = (link: Link) => link.since + STALE_AFTER_MS;

export function syncState(link: Link, now: number): SyncState {
  if (link.connected || now < link.since + RECONNECT_GRACE_MS) return "live";
  return now >= staleAt(link) ? "stale" : "reconnecting";
}

export function nextChangeAt(link: Link, now: number): number | null {
  if (link.connected || now >= staleAt(link)) return null;
  return now < link.since + RECONNECT_GRACE_MS
    ? link.since + RECONNECT_GRACE_MS
    : staleAt(link);
}
