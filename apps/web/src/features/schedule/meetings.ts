import { DateTime } from "luxon";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { slotTimeLabel } from "@schellingboard/domain/meeting-slots";
import { compareMeetings } from "./meeting-column";
import type { MeetingView } from "./meeting-view";

/**
 * The viewer's own 1-on-1s as the schedule shows them, from the replica.
 * Clashes rest on other guests' RSVPs, which the replica never holds
 * (ADR 0014 section 4); `withClashes` adds what the server says.
 */
export function meetingViewsFrom(snapshot: Snapshot, now: Date): MeetingView[] {
  const me = snapshot.me;
  if (!me) return [];
  const { timezone, breakMinutes } = snapshot.event;
  const names = new Map(me.meetingGuests.map((g) => [g.id, g.name]));
  return me.meetings
    .map((meeting): MeetingView => {
      const requester = meeting.requesterId === me.guestId;
      const otherId = requester ? meeting.recipientId : meeting.requesterId;
      const start = new Date(meeting.slotStart);
      return {
        id: meeting.id,
        status:
          meeting.status === "pending" && start.getTime() <= now.getTime()
            ? "expired"
            : meeting.status,
        role: requester ? "requester" : "recipient",
        otherId,
        otherName: names.get(otherId) ?? "Someone",
        slotStart: meeting.slotStart,
        slotEnd: meeting.slotEnd,
        dayLabel: DateTime.fromJSDate(start)
          .setZone(timezone)
          .toFormat("EEE d LLL"),
        timeLabel: slotTimeLabel(
          { start, end: new Date(meeting.slotEnd) },
          breakMinutes,
          timezone
        ),
        meetingPoint: meeting.meetingPoint,
        message: meeting.message,
        cancelNote: meeting.cancelNote,
        clashes: [],
      };
    })
    .sort(compareMeetings);
}

export function withClashes(
  views: MeetingView[],
  clashes: ReadonlyMap<string, MeetingView["clashes"]>
): MeetingView[] {
  return views.map((view) => ({
    ...view,
    clashes: clashes.get(view.id) ?? [],
  }));
}
