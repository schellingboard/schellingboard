import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReplicaStore } from "../replica/store";

const REFRESH_MS = 60_000;

/** The server's current time, which the now line and the Now jump follow. */
export function useServerNow(store: ReplicaStore): Date {
  const [minute, setMinute] = useState(0);
  const offset = useSyncExternalStore(store.subscribe, store.clockOffset);
  useEffect(() => {
    const timer = setInterval(() => setMinute((m) => m + 1), REFRESH_MS);
    return () => clearInterval(timer);
  }, [store]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the clock is read again when the minute or the offset moves
  return useMemo(() => new Date(store.serverNow()), [store, offset, minute]);
}
