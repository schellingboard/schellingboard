"use client";

import { Fragment, useContext } from "react";
import Link from "next/link";

import { EventContext } from "@/app/(site)/context";
import { sessionRooms } from "@/app/(site)/session_utils";
import { formatOptionalTime, TIME_FORMAT } from "@/utils/utils";
import { viewSessionLinkFromElsewhere } from "./modal-nav";

// A session is a copy of its proposal, not a view of it: hosts keep expecting
// the two to stay in sync, so say so wherever they would assume it.
export function ScheduledSessionsNotice({
  proposalId,
  children,
}: {
  proposalId: string;
  children: React.ReactNode;
}) {
  const { event, sessions, locations } = useContext(EventContext);
  const scheduled = sessions
    .filter((s) => s.proposalId === proposalId && s.startTime)
    .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime());
  if (!event || scheduled.length === 0) return null;

  return (
    <div className="rounded-md border border-brand-tint-hover bg-brand-tint px-3 py-2 text-sm text-fg-muted">
      This proposal is already on the schedule:{" "}
      {scheduled.map((session, i) => {
        const rooms = sessionRooms(session, locations).map((l) => l.name);
        return (
          <Fragment key={session.id}>
            {i > 0 && "; "}
            <Link
              {...viewSessionLinkFromElsewhere(event.slug, session.id)}
              className="text-brand-fg underline hover:text-brand-fg-hover transition-colors"
            >
              {formatOptionalTime(
                session.startTime,
                event.timezone,
                `EEEE ${TIME_FORMAT}`
              )}
              {rooms.length > 0 && ` in ${rooms.join(", ")}`}
            </Link>
          </Fragment>
        );
      })}
      . {children}
    </div>
  );
}
