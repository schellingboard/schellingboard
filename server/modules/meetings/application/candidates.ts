import { DateTime } from "luxon";
import type { z } from "zod";
import type { meetingCandidatesSchema } from "@schellingboard/contracts/meeting";
import {
  maxMeetingSlots,
  meetingMinutes,
  meetingRun,
  meetingSlotsForDay,
  slotTimeLabel,
} from "@schellingboard/domain/meeting-slots";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import { clashesForInterval, loadGuestSchedules } from "@/utils/guest-clashes";
import { toMeetingClashes } from "@/utils/meeting-clash-text";
import { meetingsOpen } from "@/utils/meeting-rules";
import type { MeetingDeps } from "../ports";

type MeetingCandidates = z.input<typeof meetingCandidatesSchema>;

const slotNotOpen = () =>
  notFound("meeting.slotNotOpen", "That slot is not open for 1-on-1s");

/**
 * Who the acting guest could meet at `slotStart` — the question the profile
 * picker answers the other way round (`meetingOptionsFor`: when could I meet
 * *them*). Refused as not open when the event does not offer meetings right
 * now, the viewer is not attending it, or the slot is not one the event still
 * has ahead of it; an empty candidate list is a different answer.
 */
export const listMeetingCandidates =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    {
      eventId,
      slotStart,
      slotCount,
    }: { eventId: string; slotStart: string; slotCount: number },
    now: Date
  ): Promise<Result<MeetingCandidates>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const viewerId = acting.value;

    const event = await repos.events.findById(eventId);
    if (!event || !meetingsOpen(event, now)) return slotNotOpen();

    const attending = await repos.guests.listEventsByGuests([viewerId]);
    if (!attending.get(viewerId)?.some((e) => e.id === eventId))
      return slotNotOpen();

    const start = new Date(slotStart);
    // Ahead of now and a slot the event actually offers: the same two checks
    // the request makes, so the grid never opens on a booking that would be
    // refused (issue #392, section 2.1).
    if (!(start.getTime() > now.getTime())) return slotNotOpen();
    const days = await repos.days.listByEvent(eventId);
    const day = days.find((d) => start >= d.start && start < d.end);
    if (!day) return slotNotOpen();
    const maxSlots = maxMeetingSlots(
      event.slotIncrementMinutes,
      event.maxSessionDuration
    );
    if (slotCount > maxSlots) return slotNotOpen();
    const daySlots = meetingSlotsForDay(day, event.slotIncrementMinutes);
    const run = meetingRun(daySlots, start, slotCount);
    if (!run) return slotNotOpen();
    const slot = { start, end: run[run.length - 1].end };

    const lengths = [];
    for (let count = 1; count <= maxSlots; count++) {
      if (!meetingRun(daySlots, start, count)) break;
      lengths.push({
        slotCount: count,
        minutes: meetingMinutes(
          count,
          event.slotIncrementMinutes,
          event.breakMinutes
        ),
      });
    }

    const [declaredPerSlot, eventGuests, meetingPoints, live] =
      await Promise.all([
        Promise.all(
          run.map((s) =>
            repos.meetingAvailability.listGuestsBySlot(eventId, s.start)
          )
        ),
        repos.guests.listAttendeesByEvent(eventId),
        repos.meetingPoints.listByEvent(eventId),
        repos.meetings.listLiveOverlapping(eventId, slot.start, slot.end),
      ]);
    const declaredIds = declaredPerSlot[0].filter((id) =>
      declaredPerSlot.every((ids) => ids.includes(id))
    );

    // Nobody already paired with the viewer here: asking again is refused as a
    // duplicate, and asking back across their open request only crosses it.
    const withViewer = new Set(
      live
        .filter((m) => m.requesterId === viewerId || m.recipientId === viewerId)
        .map((m) =>
          m.requesterId === viewerId ? m.recipientId : m.requesterId
        )
    );
    // An agreed 1-on-1 of theirs leaves them busy, without saying so. Only an
    // agreed one: a request they have not answered is not yet a commitment,
    // which is the rule clashesForInterval already applies.
    const inAMeeting = new Set(
      live
        .filter((m) => m.status === "accepted")
        .flatMap((m) => [m.requesterId, m.recipientId])
    );

    // One pass over the event's sessions rather than a schedule per candidate:
    // a popular slot at a big event has dozens of them, and loading four
    // queries per person is what makes a modal take seconds to open.
    const sessions = await repos.sessions.listScheduledByEvent(eventId);
    const overlapping = sessions.filter(
      (session) =>
        session.startTime != null &&
        session.endTime != null &&
        session.startTime < slot.end &&
        session.endTime > slot.start
    );
    const rsvps = await repos.rsvps.listBySessions(
      overlapping.map((s) => s.id)
    );
    const engaged = new Set<string>([
      ...overlapping.flatMap((s) => s.hosts.map((h) => h.id)),
      ...[...rsvps.values()].flatMap((list) => list.map((r) => r.guestId)),
    ]);

    // Keyed by the event's own guest list, so an availability row that outlived
    // its owner's place on the event finds nobody to describe.
    const onGuestList = new Map(eventGuests.map((g) => [g.id, g]));
    const candidates: MeetingCandidates["candidates"] = declaredIds
      .filter((id) => id !== viewerId && !withViewer.has(id))
      .flatMap((id) => {
        const guest = onGuestList.get(id);
        if (!guest) return [];
        return [
          {
            id,
            name: guest.name,
            pronouns: guest.pronouns ?? null,
            basedIn: guest.basedIn ?? null,
            avatarUrl: guest.avatarUrl ?? null,
            isHost: guest.isHost,
            busy: engaged.has(id) || inAMeeting.has(id),
          },
        ];
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // The viewer's own schedule is worth the four queries: theirs is the one
    // clash that may be named, and it is the same line the picker shows.
    const [mine] = await loadGuestSchedules(eventId, [viewerId], repos);
    const yourClashes = mine
      ? toMeetingClashes(
          clashesForInterval([mine], {
            eventId,
            start: slot.start,
            end: slot.end,
            breakMinutes: event.breakMinutes,
            detailFor: viewerId,
          }),
          viewerId
        )
      : [];

    const zoned = (date: Date) =>
      DateTime.fromJSDate(date).setZone(event.timezone);

    return ok({
      eventName: event.name,
      dayLabel: zoned(slot.start).toFormat("EEE d LLL"),
      slotLabel: slotTimeLabel(slot, event.breakMinutes, event.timezone),
      slotCount,
      lengths,
      meetingPoints: meetingPoints.map(({ id, name, description }) => ({
        id,
        name,
        description,
      })),
      yourClashes,
      candidates,
    });
  };
