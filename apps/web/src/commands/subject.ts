import { i18n } from "@lingui/core";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Session } from "@schellingboard/domain/session";
import { DateTime } from "luxon";

import { formatList } from "../i18n/format";
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
  const where = formatList(
    i18n.locale,
    session.locations.map((l) => l.name)
  );
  const details = formatList(
    i18n.locale,
    [when, where].filter(Boolean) as string[]
  );
  return `“${session.title}”${details ? ` (${details})` : ""}`;
}

export function describeProposalIn(
  replica: Snapshot,
  proposalId: string
): string | undefined {
  const proposal = replica.proposals.find((p) => p.id === proposalId);
  return proposal ? `“${proposal.title}”` : undefined;
}

export function describeSessionIn(
  replica: Snapshot,
  sessionId: string
): string | undefined {
  const { sessions, event } = eventContextFrom(replica);
  const session = sessions.find((s) => s.id === sessionId);
  return session ? describeSession(session, event.timezone) : undefined;
}
