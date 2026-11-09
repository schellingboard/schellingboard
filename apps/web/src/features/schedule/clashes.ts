import type { Session } from "@schellingboard/domain/session";
import { sessionsOverlap } from "@schellingboard/domain/session-overlap";
import type { MeetingView } from "./meeting-view";

export type Clash =
  | { kind: "session"; session: Session }
  | { kind: "meeting"; meeting: MeetingView };

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

  const { startTime, endTime } = session;
  if (startTime && endTime) {
    for (const meeting of meetings ?? []) {
      if (
        meeting.status === "accepted" &&
        new Date(meeting.slotStart) < endTime &&
        new Date(meeting.slotEnd) > startTime
      ) {
        clashes.push({
          clash: { kind: "meeting", meeting },
          start: new Date(meeting.slotStart).getTime(),
        });
      }
    }
  }
  return clashes.sort((a, b) => a.start - b.start).map(({ clash }) => clash);
}

export function describeClash(
  clash: Clash,
  currentUser: string | null
): string {
  if (clash.kind === "meeting") {
    return `your 1-on-1 with ${clash.meeting.otherName}`;
  }
  const { session } = clash;
  const hosting = session.hosts.some((h) => h.id === currentUser);
  return `"${session.title}", which you are ${hosting ? "hosting" : "attending"}`;
}

export function clashMessage(
  clashes: Clash[],
  currentUser: string | null
): string {
  const list = clashes.map((c) => describeClash(c, currentUser)).join("; ");
  return `This session clashes with ${list}. Do you want to RSVP anyway?`;
}
