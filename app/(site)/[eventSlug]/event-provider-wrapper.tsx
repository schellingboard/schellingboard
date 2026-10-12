"use client";

import Link from "next/link";
import { useContext, useMemo } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { EventProvider, UserContext } from "@/app/(site)/context";
import type { EventContextType } from "@/app/(site)/context";
import { eventContextFrom } from "./replica/selectors";
import { useLiveReplica } from "./replica/use-live-replica";

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
  const { replica, gone } = useLiveReplica(snapshot, user);
  const context = useMemo(() => eventContextFrom(replica), [replica]);

  const value = useMemo(
    () => ({ ...context, myMeetings, now }),
    [context, myMeetings, now]
  );

  if (gone) {
    return (
      <div role="status" className="p-6">
        <p>This event has been deleted.</p>
        <Link href="/" className="underline">
          Back to the events
        </Link>
      </div>
    );
  }

  return <EventProvider value={value}>{children}</EventProvider>;
}
