import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReplicaStore } from "../replica/store";
import { nextChangeAt, syncState, type SyncState } from "../replica/sync-state";
import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

const COPY: Record<SyncState, MessageDescriptor> = {
  live: msg({ message: "Live", context: "Connection status: up to date" }),
  reconnecting: msg`Reconnecting…`,
  stale: msg`Not updating: may be out of date`,
};
const TEXT: Record<SyncState, string> = {
  live: "text-fg-subtle",
  reconnecting: "text-warning-fg",
  stale: "text-danger-fg",
};
const DOT: Record<SyncState, string> = {
  live: "bg-success-fg",
  reconnecting: "bg-warning",
  stale: "bg-danger",
};

/** The replica's link state, moving on at the instant the state next changes. */
export function useSyncState(
  store: ReplicaStore,
  now: () => number = () => performance.now()
): SyncState {
  const link = useSyncExternalStore(store.subscribe, store.link);
  const [tick, setTick] = useState(now);
  const at = nextChangeAt(link, tick);

  useEffect(() => {
    if (at === null) return;
    const timer = setTimeout(() => setTick(now()), Math.max(0, at - now()));
    return () => clearTimeout(timer);
  }, [at, now]);

  return syncState(link, Math.max(tick, now()));
}

export function SyncIndicator({
  store,
  now,
}: {
  store: ReplicaStore;
  now?: () => number;
}) {
  const state = useSyncState(store, now);
  return (
    <span
      aria-live="polite"
      className={`ml-auto flex items-center gap-1.5 py-1.5 text-xs ${TEXT[state]}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${DOT[state]}`}
      />
      {i18n._(COPY[state])}
    </span>
  );
}
