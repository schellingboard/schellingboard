import type { Event } from "@schellingboard/domain/event";
import type { Meeting, MeetingStatus } from "@schellingboard/domain/meeting";
import {
  maxMeetingSlots,
  meetingRun,
  meetingSlotsForDay,
} from "@schellingboard/domain/meeting-slots";
import { inSchedPhase } from "@schellingboard/domain/phase";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  invalid,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { MeetingDeps } from "../ports";

export interface MeetingRequestInput {
  eventId: string;
  recipientId: string;
  slotStart: string;
  slotCount: number;
  meetingPoint: string;
  message?: string;
}

export interface MeetingChange {
  meeting: Meeting;
  eventSlug: string;
}

const NOT_OPEN = "1-on-1s are only open while the event is scheduling";

export const eventNotFound = () =>
  notFound("event.notFound", "Event not found");

export function closedFor(event: Event, now: Date): Failure | null {
  if (!event.meetingsEnabled)
    return forbidden(
      "event.meetingsDisabled",
      "1-on-1s are not enabled for this event"
    );
  return inSchedPhase(event, now)
    ? null
    : forbidden("event.notSchedulingPhase", NOT_OPEN);
}

export async function attendees(
  repos: MeetingDeps["repos"],
  eventId: string,
  guestIds: string[]
): Promise<(id: string) => boolean> {
  const attending = await repos.guests.listEventsByGuests(guestIds);
  return (id) => attending.get(id)?.some((e) => e.id === eventId) ?? false;
}

export const requestMeeting =
  ({ repos, notifyMeetingRequested }: MeetingDeps) =>
  async (
    actor: Actor,
    input: MeetingRequestInput,
    now: Date
  ): Promise<Result<Meeting>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const requesterId = acting.value;
    if (requesterId === input.recipientId)
      return invalid("meeting.self", "You can't book a 1-on-1 with yourself");

    const meetingPoint = input.meetingPoint.trim();
    if (!meetingPoint)
      return invalid("meeting.pointRequired", "Choose or type where to meet");

    const event = await repos.events.findById(input.eventId);
    if (!event) return eventNotFound();
    const closed = closedFor(event, now);
    if (closed) return closed;

    const attends = await attendees(repos, event.id, [
      requesterId,
      input.recipientId,
    ]);
    if (!attends(requesterId))
      return forbidden("guest.notInEvent", "You are not attending this event");
    if (!attends(input.recipientId))
      return invalid(
        "meeting.recipientNotInEvent",
        "They are not attending this event"
      );

    if (
      input.slotCount >
      maxMeetingSlots(event.slotIncrementMinutes, event.maxSessionDuration)
    )
      return invalid(
        "meeting.tooLong",
        "That 1-on-1 is longer than the event allows"
      );

    const slotStart = new Date(input.slotStart);
    const days = await repos.days.listByEvent(event.id);
    const day = days.find((d) => slotStart >= d.start && slotStart < d.end);
    const run = day
      ? meetingRun(
          meetingSlotsForDay(day, event.slotIncrementMinutes),
          slotStart,
          input.slotCount
        )
      : null;
    if (!run)
      return invalid("meeting.slotUnavailable", "That slot is not available");

    // A multi-day event goes on offering yesterday's slots, and the open-request
    // cap only counts requests still ahead -- so without this, day one stays
    // bookable on day three and every request against it is free of the cap.
    if (slotStart <= now)
      return conflict("meeting.slotPassed", "That slot has already passed");

    // A slot they cleared is the one hard no in the feature: a clash is only a
    // warning the requester already waved through, but this is their decision.
    const declared = await repos.meetingAvailability.listByGuestAndEvent(
      input.recipientId,
      event.id
    );
    const declaredStarts = new Set(declared.map((slot) => slot.getTime()));
    if (!run.every((slot) => declaredStarts.has(slot.start.getTime())))
      return conflict(
        "meeting.recipientUnavailable",
        "They are not available at that time"
      );

    const outcome = await repos.meetings.createIfAllowed(
      {
        eventId: event.id,
        requesterId,
        recipientId: input.recipientId,
        slotStart,
        slotEnd: run[run.length - 1].end,
        meetingPoint,
        message: input.message?.trim() ?? "",
        createdAt: now,
      },
      event.maxOpenMeetingRequests,
      now
    );
    if ("refused" in outcome)
      return outcome.refused === "duplicate"
        ? conflict(
            "meeting.duplicate",
            "You have already asked them for that time"
          )
        : conflict(
            "meeting.tooManyOpen",
            `You already have ${event.maxOpenMeetingRequests} requests waiting for an answer. Wait for a reply, or cancel one first.`
          );

    await notifyMeetingRequested({ meeting: outcome.meeting, now });
    return ok(outcome.meeting);
  };

async function standingMeeting(
  repos: MeetingDeps["repos"],
  meeting: Meeting,
  now: Date
): Promise<Result<Event>> {
  // Only the phase, not `meetingsEnabled`: the switch stops new requests, and
  // a pair already holding one still have to settle it.
  const event = await repos.events.findById(meeting.eventId);
  if (!event || !inSchedPhase(event, now))
    return forbidden("event.notSchedulingPhase", NOT_OPEN);
  // Expiry is derived rather than swept (issue #392, section 2.4): a meeting
  // whose slot has begun can no longer be agreed to or called off.
  if (meeting.slotStart.getTime() <= now.getTime())
    return conflict("meeting.started", "That slot has already started");
  return ok(event);
}

const meetingNotFound = () => notFound("meeting.notFound", "1-on-1 not found");

export const respondToMeeting =
  ({ repos, notifyMeetingOutcome }: MeetingDeps) =>
  async (
    actor: Actor,
    input: { meetingId: string; response: "accept" | "decline" },
    now: Date
  ): Promise<Result<MeetingChange>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const meeting = await repos.meetings.findById(input.meetingId);
    if (!meeting) return meetingNotFound();
    if (meeting.recipientId !== acting.value)
      return forbidden(
        "meeting.notRecipient",
        "Only the person asked can answer this"
      );
    const event = await standingMeeting(repos, meeting, now);
    if (!event.ok) return event;

    const outcome = input.response === "accept" ? "accepted" : "declined";
    const answered = await repos.meetings.updateStatus(
      meeting.id,
      outcome,
      now,
      ["pending"]
    );
    if (!answered)
      return conflict(
        "meeting.alreadyAnswered",
        "This request has already been answered"
      );

    await notifyMeetingOutcome({
      meeting: answered,
      outcome,
      actorId: acting.value,
      now,
    });
    return ok({ meeting: answered, eventSlug: event.value.slug });
  };

export const cancelMeeting =
  ({ repos, notifyMeetingOutcome }: MeetingDeps) =>
  async (
    actor: Actor,
    input: { meetingId: string; note?: string },
    now: Date
  ): Promise<Result<MeetingChange>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const meeting = await repos.meetings.findById(input.meetingId);
    if (!meeting) return meetingNotFound();
    const isRequester = meeting.requesterId === acting.value;
    if (!isRequester && meeting.recipientId !== acting.value)
      return forbidden("meeting.notParticipant", "This isn't your 1-on-1");
    const event = await standingMeeting(repos, meeting, now);
    if (!event.ok) return event;

    // The person asked has Decline; "canceled" would misdescribe that.
    if (!isRequester && meeting.status === "pending")
      return conflict(
        "meeting.recipientMustDecline",
        "You were the one asked — decline it instead"
      );

    const from: MeetingStatus[] = isRequester
      ? ["pending", "accepted"]
      : ["accepted"];
    // The note goes in with the status change: a cancel the compare-and-set
    // refuses must leave no word about it on a meeting that still stands.
    const canceled = await repos.meetings.updateStatus(
      meeting.id,
      "canceled",
      now,
      from,
      input.note?.trim() ?? ""
    );
    if (!canceled)
      return conflict(
        "meeting.nothingToCancel",
        "There is nothing left to cancel"
      );

    await notifyMeetingOutcome({
      meeting: canceled,
      outcome: "canceled",
      actorId: acting.value,
      now,
    });
    return ok({ meeting: canceled, eventSlug: event.value.slug });
  };
