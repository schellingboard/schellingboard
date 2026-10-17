export type SyncState = "live" | "reconnecting" | "stale";
export type Link = { connected: boolean; since: number };

export const STALE_AFTER_MS = 15_000;

export const staleAt = (link: Link) => link.since + STALE_AFTER_MS;

export function syncState(link: Link, now: number): SyncState {
  if (link.connected) return "live";
  return now >= staleAt(link) ? "stale" : "reconnecting";
}
