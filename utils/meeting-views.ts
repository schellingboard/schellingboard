import { DateTime } from "luxon";
import { getRepositories, type Repositories } from "@/db/container";
import type { z } from "zod";
import type { myMeetingsSchema } from "@schellingboard/contracts/meeting";
import { clashesForInterval, loadGuestSchedules } from "@/utils/guest-clashes";
import { toMeetingClashes } from "@/utils/meeting-clash-text";
import { slotTimeLabel } from "@schellingboard/domain/meeting-slots";

export type MyMeetingsResponse = z.infer<typeof myMeetingsSchema>;
export type MeetingView = MyMeetingsResponse["meetings"][number];
export type MeetingViewStatus = MeetingView["status"];

/**
 * The viewer's own 1-on-1s at an event, in every state — the caller decides
 * what to show, since the grid drops declined and expired ones while the modal
 * a notification links to must still explain them.
 *
 * Clashes are computed here rather than in the browser: they rest on other
 * guests' RSVPs, which never leave the server.
 */
export async function meetingViewsFor(
  viewerId: string,
  eventId: string,
  now: Date,
  repos: Pick<
    Repositories,
    "events" | "guests" | "sessions" | "meetings"
  > = getRepositories()
): Promise<MeetingView[]> {
  const event = await repos.events.findById(eventId);
  if (!event) return [];

  const meetings = await repos.meetings.listByGuestAndEvent(viewerId, eventId);
  if (meetings.length === 0) return [];

  const otherIds = new Set(
    meetings.map((m) =>
      m.requesterId === viewerId ? m.recipientId : m.requesterId
    )
  );
  // Loaded once for everyone involved: a guest's schedule is several queries,
  // and the same person may appear in several of these meetings.
  const schedules = await loadGuestSchedules(
    eventId,
    [viewerId, ...otherIds],
    repos
  );
  const byGuest = new Map(schedules.map((s) => [s.guestId, s]));

  const zoned = (date: Date) =>
    DateTime.fromJSDate(date).setZone(event.timezone);

  return meetings.map((meeting) => {
    const otherId =
      meeting.requesterId === viewerId
        ? meeting.recipientId
        : meeting.requesterId;
    const involved = [byGuest.get(viewerId), byGuest.get(otherId)].filter(
      (schedule) => schedule !== undefined
    );
    const clashes = clashesForInterval(involved, {
      eventId,
      start: meeting.slotStart,
      end: meeting.slotEnd,
      breakMinutes: event.breakMinutes,
      detailFor: viewerId,
      // An accepted meeting counts as busy, so without this every one of them
      // would report itself as its own clash.
      excludeMeetingId: meeting.id,
    });
    return {
      id: meeting.id,
      status:
        meeting.status === "pending" &&
        meeting.slotStart.getTime() <= now.getTime()
          ? "expired"
          : meeting.status,
      role: meeting.requesterId === viewerId ? "requester" : "recipient",
      otherId,
      otherName: byGuest.get(otherId)?.guestName ?? "Someone",
      slotStart: meeting.slotStart.toISOString(),
      slotEnd: meeting.slotEnd.toISOString(),
      dayLabel: zoned(meeting.slotStart).toFormat("EEE d LLL"),
      timeLabel: slotTimeLabel(
        { start: meeting.slotStart, end: meeting.slotEnd },
        event.breakMinutes,
        event.timezone
      ),
      meetingPoint: meeting.meetingPoint,
      message: meeting.message,
      cancelNote: meeting.cancelNote,
      clashes: toMeetingClashes(clashes, viewerId),
    };
  });
}

export async function myMeetingsFor(
  viewerId: string,
  eventId: string,
  now: Date,
  repos: Pick<
    Repositories,
    "events" | "guests" | "sessions" | "meetings" | "meetingAvailability"
  > = getRepositories()
): Promise<MyMeetingsResponse> {
  const [meetings, availability] = await Promise.all([
    meetingViewsFor(viewerId, eventId, now, repos),
    repos.meetingAvailability.listByGuestAndEvent(viewerId, eventId),
  ]);
  return {
    meetings,
    availability: availability.map((slot) => slot.toISOString()),
  };
}
