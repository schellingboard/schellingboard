"use client";

import Link from "next/link";
import { useContext, useMemo } from "react";
import type { Rsvp } from "@schellingboard/domain/session";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { EventProvider, UserContext } from "@/app/legacy/(site)/context";
import type { EventContextType } from "@/app/legacy/(site)/context";
import { eventContextFrom } from "./replica/selectors";
import { useLiveReplica } from "./replica/use-live-replica";
import { useOptimisticRsvps } from "./replica/use-optimistic-rsvps";

const NO_RSVPS: Rsvp[] = [];

export function EventProviderWrapper({
  snapshot,
  myMeetings,
  now,
  children,
}: {
  snapshot: Snapshot;
  myMeetings: EventContextType["myMeetings"];
  now: Date;
  children: React.ReactNode;
}) {
  const { user } = useContext(UserContext);
  const { replica, gone, meetingsRevision, deliveredKeys, sync } =
    useLiveReplica(snapshot, user);
  const { shown, updateRsvp } = useOptimisticRsvps(replica, deliveredKeys);
  const context = useMemo(() => eventContextFrom(shown), [shown]);

  // The replica's viewer lags a name switch until its snapshot lands.
  const rsvps = replica.me?.guestId === user ? context.rsvps : NO_RSVPS;
  const value = useMemo(
    () => ({
      ...context,
      rsvps,
      myMeetings,
      now,
      meetingsRevision,
      sync,
      updateRsvp,
    }),
    [context, rsvps, myMeetings, now, meetingsRevision, sync, updateRsvp]
  );

  if (gone) {
    return (
      <div role="status" className="p-6">
        <p>This event has been deleted.</p>
        <Link href="/legacy" className="underline">
          Back to the events
        </Link>
      </div>
    );
  }

  return <EventProvider value={value}>{children}</EventProvider>;
}
