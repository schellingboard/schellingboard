import { DateTime } from "luxon";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Session } from "@schellingboard/domain/session";
import { eventContextFrom } from "../replica/selectors";

/** “Title” (Mon 10:00, Room A): enough for the user to know which session failed. */
export function describeSession(
  session: Pick<Session, "title" | "startTime" | "locations">,
  timezone: string
): string {
  const when = session.startTime
    ? DateTime.fromJSDate(session.startTime)
        .setZone(timezone)
        .toFormat("ccc HH:mm")
    : undefined;
  const where = session.locations.map((l) => l.name).join(", ");
  const details = [when, where].filter(Boolean).join(", ");
  return `“${session.title}”${details ? ` (${details})` : ""}`;
}

export function describeProposalIn(replica: Snapshot, proposalId: string) {
  const proposal = replica.proposals.find((p) => p.id === proposalId);
  return proposal ? `“${proposal.title}”` : "the proposal";
}

export function describeSessionIn(replica: Snapshot, sessionId: string) {
  const { sessions, event } = eventContextFrom(replica);
  const session = sessions.find((s) => s.id === sessionId);
  return session ? describeSession(session, event.timezone) : "the session";
}
