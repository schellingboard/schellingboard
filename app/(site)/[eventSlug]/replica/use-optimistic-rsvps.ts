"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import {
  dropFrom,
  expirePendingRsvps,
  nextExpiryAt,
  settlePendingRsvps,
  withPendingRsvps,
  type PendingRsvp,
} from "./rsvp-overlay";

let nextId = 0;

export type RsvpResult = { ok: true } | { ok: false; error?: string };

export function useOptimisticRsvps(replica: Snapshot) {
  const [pending, setPending] = useState<PendingRsvp[]>([]);
  const live = settlePendingRsvps(replica, pending);
  if (live !== pending) setPending(live);
  const shown = useMemo(() => withPendingRsvps(replica, live), [replica, live]);

  const latest = useRef({ replica, live });
  useEffect(() => {
    latest.current = { replica, live };
  });

  useEffect(() => {
    const expiresAt = nextExpiryAt(live, replica.seq);
    if (expiresAt === null) return;
    // eslint-disable-next-line no-restricted-syntax -- a real-time window after the server's answer
    const wait = expiresAt - Date.now();
    const timer = setTimeout(
      () =>
        setPending((current) =>
          // eslint-disable-next-line no-restricted-syntax -- see above
          expirePendingRsvps(current, Date.now(), replica.seq)
        ),
      Math.max(0, wait)
    );
    return () => clearTimeout(timer);
  }, [live, replica.seq]);

  const updateRsvp = useCallback(
    async (
      guestId: string,
      sessionId: string,
      remove: boolean
    ): Promise<RsvpResult> => {
      const id = nextId++;
      const drop = () => setPending((all) => dropFrom(all, id, sessionId));
      const { replica: current, live: queued } = latest.current;
      // What the guest sees, so a toggle after an unsettled one is not a no-op.
      const expected = withPendingRsvps(current, queued);
      const held =
        expected.me?.rsvps.some((r) => r.sessionId === sessionId) ?? false;
      const clickSeq = current.seq;
      const toggle: PendingRsvp = {
        id,
        guestId,
        sessionId,
        remove,
        baseCount: expected.counts[sessionId] ?? 0,
        noop: held !== remove,
        acknowledged: false,
      };
      setPending((all) => [...all, toggle]);
      // The effect that refreshes `latest` runs after the next commit; a second
      // click before it must already see this toggle.
      latest.current = { replica: current, live: [...queued, toggle] };
      try {
        const response = await fetch("/api/toggle-rsvp", {
          method: "POST",
          body: JSON.stringify({ guestId, sessionId, remove }),
        });
        if (!response.ok) {
          drop();
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          return { ok: false, error: body?.error };
        }
        // eslint-disable-next-line no-restricted-syntax -- see above
        const acknowledgedAt = Date.now();
        setPending((all) =>
          all.map((op) =>
            op.id === id
              ? { ...op, acknowledged: true, acknowledgedAt, clickSeq }
              : op
          )
        );
        return { ok: true };
      } catch (error: unknown) {
        console.error("Error updating RSVP:", error);
        drop();
        return { ok: false };
      }
    },
    []
  );

  return { shown, updateRsvp };
}
