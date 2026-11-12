import { t } from "@lingui/core/macro";
import type { Session } from "@schellingboard/domain/session";
import { sessionsOverlap } from "@schellingboard/domain/session-overlap";
import type { MeetingView } from "./meeting-view";

export type Clash =
  | { kind: "session"; session: Session }
  | { kind: "meeting"; meeting: MeetingView };

function meetsSession(meeting: MeetingView, session: Session) {
  const { startTime, endTime } = session;
  return (
    meeting.status === "accepted" &&
    !!startTime &&
    !!endTime &&
    new Date(meeting.slotStart) < endTime &&
    new Date(meeting.slotEnd) > startTime
  );
}

// `meetings` is null until the viewer's 1-on-1s have loaded; until then only
// sessions can be reported.
export function findClashes(
  session: Session,
  busySessions: Session[],
  meetings: MeetingView[] | null
): Clash[] {
  const clashes: { clash: Clash; start: number }[] = busySessions
    .filter((other) => sessionsOverlap(session, other))
    .map((other) => ({
      clash: { kind: "session", session: other },
      start: other.startTime?.getTime() ?? 0,
    }));

  for (const meeting of meetings ?? []) {
    if (meetsSession(meeting, session)) {
      clashes.push({
        clash: { kind: "meeting", meeting },
        start: new Date(meeting.slotStart).getTime(),
      });
    }
  }
  return clashes.sort((a, b) => a.start - b.start).map(({ clash }) => clash);
}

export function clashesAmong(
  sessions: Session[],
  meetings: MeetingView[] | null
): Map<string, Clash[]> {
  const real = sessions.filter((s) => !s.blocker);
  const found = new Map<string, Clash[]>();
  for (const session of real) {
    const clashes = findClashes(
      session,
      real.filter((other) => other.id !== session.id),
      meetings
    );
    if (clashes.length > 0) found.set(session.id, clashes);
  }
  return found;
}

export function meetingClashes(
  sessions: Session[],
  meetings: MeetingView[]
): string[] {
  return meetings
    .filter((m) => sessions.some((s) => !s.blocker && meetsSession(m, s)))
    .map((m) => m.id);
}

export function describeClash(
  clash: Clash,
  currentUser: string | null
): string {
  if (clash.kind === "meeting") {
    const { otherName } = clash.meeting;
    return t`your 1-on-1 with ${otherName}`;
  }
  const { session } = clash;
  const hosting = session.hosts.some((h) => h.id === currentUser);
  const { title } = session;
  return hosting
    ? t`"${title}", which you are hosting`
    : t`"${title}", which you are attending`;
}

export function clashMessage(
  clashes: Clash[],
  currentUser: string | null
): string {
  const list = clashes.map((c) => describeClash(c, currentUser)).join("; ");
  return t`This session clashes with ${list}. Do you want to RSVP anyway?`;
}
