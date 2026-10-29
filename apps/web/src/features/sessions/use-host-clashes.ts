import { useEffect, useState } from "react";
import type { HostClashQuery } from "../../commands/session-form";
import type { HostClash } from "./session-model";

/**
 * Where the hosts are already committed during the interval. The server
 * answers, since a host's RSVPs are private and never reach the replica.
 */
export function useHostClashes(
  ask: (query: HostClashQuery) => Promise<HostClash[] | undefined>,
  {
    eventId,
    guestIds,
    start,
    end,
    excludeSessionId,
  }: {
    eventId: string;
    guestIds: string[];
    start: number | undefined;
    end: number | undefined;
    excludeSessionId?: string;
  }
) {
  const [answer, setAnswer] = useState<{
    key: string;
    clashes: HostClash[];
  } | null>(null);
  const hostKey = guestIds.join(",");
  const key =
    start === undefined || end === undefined || !hostKey
      ? null
      : [eventId, hostKey, start, end, excludeSessionId].join("|");

  useEffect(() => {
    if (key === null || start === undefined || end === undefined) return;
    let cancelled = false;
    const settle = (clashes: HostClash[] = []) => {
      if (!cancelled) setAnswer({ key, clashes });
    };
    ask({
      eventId,
      guestIds: hostKey.split(","),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      excludeSessionId,
    }).then(settle, () => settle());
    return () => {
      cancelled = true;
    };
  }, [ask, key, eventId, hostKey, start, end, excludeSessionId]);

  return {
    clashes: key === null ? [] : (answer?.clashes ?? []),
    checking: key !== null && answer?.key !== key,
  };
}
