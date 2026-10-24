import { useEffect, useState } from "react";
import type { ReplicaStore } from "../replica/store";

const REFRESH_MS = 60_000;

/** The server's current time, which the now line and the Now jump follow. */
export function useServerNow(store: ReplicaStore): Date {
  const [now, setNow] = useState(() => new Date(store.serverNow()));
  useEffect(() => {
    const timer = setInterval(
      () => setNow(new Date(store.serverNow())),
      REFRESH_MS
    );
    return () => clearInterval(timer);
  }, [store]);
  return now;
}
