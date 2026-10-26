import { Fragment, type ReactNode } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { formatOptionalTime, TIME_FORMAT } from "@schellingboard/domain/time";
import type { ProposalLinks } from "./links";

/**
 * A session is a copy of its proposal, not a view of it: hosts keep expecting
 * the two to stay in sync, so say so wherever they would assume it.
 */
export function ScheduledSessionsNotice({
  proposalId,
  snapshot,
  links,
  children,
}: {
  proposalId: string;
  snapshot: Snapshot;
  links: Pick<ProposalLinks, "session">;
  children: ReactNode;
}) {
  const scheduled = snapshot.sessions
    .filter((s) => s.proposalId === proposalId && s.startTime)
    .sort((a, b) => a.startTime!.localeCompare(b.startTime!));
  if (scheduled.length === 0) return null;

  return (
    <div className="rounded-md border border-brand-tint-hover bg-brand-tint px-3 py-2 text-sm text-fg-muted">
      This proposal is already on the schedule:{" "}
      {scheduled.map((session, i) => {
        const rooms = session.locationIds.flatMap(
          (id) => snapshot.locations.find((l) => l.id === id)?.name ?? []
        );
        return (
          <Fragment key={session.id}>
            {i > 0 && "; "}
            <a
              href={links.session(session.id)}
              className="text-brand-fg underline transition-colors hover:text-brand-fg-hover"
            >
              {formatOptionalTime(
                new Date(session.startTime!),
                snapshot.event.timezone,
                `EEEE ${TIME_FORMAT}`
              )}
              {rooms.length > 0 && ` in ${rooms.join(", ")}`}
            </a>
          </Fragment>
        );
      })}
      . {children}
    </div>
  );
}
