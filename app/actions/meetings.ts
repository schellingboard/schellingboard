"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { getRepositories } from "@/db/container";
import {
  unverifiedUserMessage,
  verifiedCurrentUser,
} from "@/utils/acting-guest";
import { requireSiteAuth } from "@/utils/action-auth";
import { serverNow } from "@/utils/dev-clock-server";
import {
  maxMeetingSlots,
  meetingRun,
  meetingSlotsForDay,
} from "@/utils/meeting-slots";
import {
  notifyMeetingOutcome,
  notifyMeetingRequested,
} from "@/utils/notifications";
import { inSchedPhase } from "@schellingboard/domain/phase";
import type { MeetingStatus } from "@schellingboard/domain/meeting";
import type { Event } from "@schellingboard/domain/event";
import {
  meetingAvailabilitySchema,
  meetingCancelSchema,
  meetingRequestSchema,
  meetingRespondSchema,
} from "@schellingboard/contracts/meeting";

// A "use server" export is a public endpoint behind site auth, so each
// action's parameter type is advisory: the payload is parsed against its
// contract, and a malformed one comes back as a result instead of throwing.

export type MeetingActionResult = { ok: true } | { ok: false; error: string };

const NOT_OPEN = "1-on-1s are only open while the event is scheduling";

function closedReason(event: Event, now: Date): string | null {
  if (!event.meetingsEnabled) return "1-on-1s are not enabled for this event";
  return inSchedPhase(event, now) ? null : NOT_OPEN;
}

/**
 * Every slot start the event offers, as ISO strings. Deliberately not
 * exported: an export from a "use server" module is a client-callable
 * endpoint, and this is a helper.
 */
async function eventSlotStarts(event: Event): Promise<Set<string>> {
  const days = await getRepositories().days.listByEvent(event.id);
  return new Set(
    days.flatMap((day) =>
      meetingSlotsForDay(day, event.slotIncrementMinutes).map((slot) =>
        slot.start.toISOString()
      )
    )
  );
}

export async function requestMeetingAction(
  raw: z.input<typeof meetingRequestSchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();

  const parsed = meetingRequestSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const input = parsed.data;

  const requesterId = await verifiedCurrentUser(await cookies());
  if (!requesterId) {
    return { ok: false, error: "Sign in to request a 1-on-1" };
  }
  if (requesterId === input.recipientId) {
    return { ok: false, error: "You can't book a 1-on-1 with yourself" };
  }

  // Presets are a convenience, not a constraint -- but "we'll figure it out"
  // is not an option, so some place has to be named.
  const meetingPoint = input.meetingPoint.trim();
  if (!meetingPoint) {
    return { ok: false, error: "Choose or type where to meet" };
  }

  const repos = getRepositories();
  const event = await repos.events.findById(input.eventId);
  if (!event) return { ok: false, error: "Event not found" };
  const now = await serverNow();
  const closed = closedReason(event, now);
  if (closed) return { ok: false, error: closed };

  const attending = await repos.guests.listEventsByGuests([
    requesterId,
    input.recipientId,
  ]);
  const attends = (id: string) =>
    attending.get(id)?.some((e) => e.id === event.id) ?? false;
  if (!attends(requesterId)) {
    return { ok: false, error: "You are not attending this event" };
  }
  if (!attends(input.recipientId)) {
    return { ok: false, error: "They are not attending this event" };
  }

  if (
    input.slotCount >
    maxMeetingSlots(event.slotIncrementMinutes, event.maxSessionDuration)
  ) {
    return { ok: false, error: "That 1-on-1 is longer than the event allows" };
  }

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
  if (!run) {
    return { ok: false, error: "That slot is not available" };
  }

  // A multi-day event goes on offering yesterday's slots, and the open-request
  // cap only counts requests still ahead -- so without this, day one stays
  // bookable on day three and every request against it is free of the cap.
  if (new Date(input.slotStart) <= now) {
    return { ok: false, error: "That slot has already passed" };
  }

  // A slot they cleared is the one hard no in the feature: a clash is only a
  // warning the requester already waved through, but this is their decision.
  const declared = await repos.meetingAvailability.listByGuestAndEvent(
    input.recipientId,
    event.id
  );
  const declaredStarts = new Set(declared.map((slot) => slot.getTime()));
  if (!run.every((slot) => declaredStarts.has(slot.start.getTime()))) {
    return { ok: false, error: "They are not available at that time" };
  }
  const slotEnd = run[run.length - 1].end;

  const outcome = await repos.meetings.createIfAllowed(
    {
      eventId: event.id,
      requesterId,
      recipientId: input.recipientId,
      slotStart,
      slotEnd,
      meetingPoint,
      message: input.message?.trim() ?? "",
      createdAt: now,
    },
    event.maxOpenMeetingRequests,
    now
  );
  if ("refused" in outcome) {
    return {
      ok: false,
      error:
        outcome.refused === "duplicate"
          ? "You have already asked them for that time"
          : `You already have ${event.maxOpenMeetingRequests} requests waiting for an answer. Wait for a reply, or cancel one first.`,
    };
  }

  await notifyMeetingRequested({ meeting: outcome.meeting, now });

  return { ok: true };
}

/**
 * The recipient's answer to a request. Accepting has nothing to reject — no
 * room is reserved and a clash is only ever a warning — so this is a status
 * change plus telling the requester.
 */
export async function respondToMeetingAction(
  raw: z.input<typeof meetingRespondSchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();

  const parsed = meetingRespondSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const input = parsed.data;

  const guestId = await verifiedCurrentUser(await cookies());
  if (!guestId) {
    return { ok: false, error: "Sign in to answer a 1-on-1 request" };
  }

  const repos = getRepositories();
  const meeting = await repos.meetings.findById(input.meetingId);
  if (!meeting) return { ok: false, error: "1-on-1 not found" };
  // Only the person asked can answer; the requester's own control is cancelling.
  if (meeting.recipientId !== guestId) {
    return { ok: false, error: "Only the person asked can answer this" };
  }

  // Only the phase, not `meetingsEnabled`: the switch stops new requests, and
  // a pair already holding one still have to settle it.
  const now = await serverNow();
  const event = await repos.events.findById(meeting.eventId);
  if (!event || !inSchedPhase(event, now)) {
    return { ok: false, error: NOT_OPEN };
  }
  // Expiry is derived rather than swept (issue #392, section 2.4), so it is
  // checked here: answering a request whose slot has begun would agree to a
  // past meeting.
  if (meeting.slotStart.getTime() <= now.getTime()) {
    return { ok: false, error: "That slot has already started" };
  }

  const outcome = input.response === "accept" ? "accepted" : "declined";
  const answered = await repos.meetings.updateStatus(meeting.id, outcome, now, [
    "pending",
  ]);
  if (!answered) {
    return { ok: false, error: "This request has already been answered" };
  }

  await notifyMeetingOutcome({
    meeting: answered,
    outcome,
    actorId: guestId,
    now,
  });

  revalidatePath(`/${event.slug}`);
  return { ok: true };
}

/**
 * Calling a meeting off. Either party may cancel one they had agreed; while it
 * is still pending only the requester may, since the person asked has Decline
 * — and being told "canceled" where they had declined would misdescribe it.
 */
export async function cancelMeetingAction(
  raw: z.input<typeof meetingCancelSchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();

  const parsed = meetingCancelSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const input = parsed.data;

  const guestId = await verifiedCurrentUser(await cookies());
  if (!guestId) {
    return { ok: false, error: "Sign in to cancel a 1-on-1" };
  }

  const repos = getRepositories();
  const meeting = await repos.meetings.findById(input.meetingId);
  if (!meeting) return { ok: false, error: "1-on-1 not found" };
  const isRequester = meeting.requesterId === guestId;
  if (!isRequester && meeting.recipientId !== guestId) {
    return { ok: false, error: "This isn't your 1-on-1" };
  }

  const now = await serverNow();
  const event = await repos.events.findById(meeting.eventId);
  if (!event || !inSchedPhase(event, now)) {
    return { ok: false, error: NOT_OPEN };
  }
  // A meeting that has already begun happened or didn't; calling it off after
  // the fact would only send its other half a notification about the past.
  if (meeting.slotStart.getTime() <= now.getTime()) {
    return { ok: false, error: "That slot has already started" };
  }

  if (!isRequester && meeting.status === "pending") {
    return {
      ok: false,
      error: "You were the one asked — decline it instead",
    };
  }

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
  if (!canceled) {
    return { ok: false, error: "There is nothing left to cancel" };
  }

  await notifyMeetingOutcome({
    meeting: canceled,
    outcome: "canceled",
    actorId: guestId,
    now,
  });

  revalidatePath(`/${event.slug}`);
  return { ok: true };
}

export async function saveMeetingAvailabilityAction(
  raw: z.input<typeof meetingAvailabilitySchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();

  const parsed = meetingAvailabilitySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const input = parsed.data;

  // Site auth is shared with every attendee, so it cannot be the gate on
  // writing one guest's own availability.
  const cookieStore = await cookies();
  const guestId = await verifiedCurrentUser(cookieStore);
  if (!guestId) {
    // Shared with the page, so the copy can't drift -- and so a protected name
    // selected without verifying is told to switch to it, not to "sign in".
    return {
      ok: false,
      error: await unverifiedUserMessage(
        cookieStore,
        "setting your 1-on-1 availability"
      ),
    };
  }

  const repos = getRepositories();
  const event = await repos.events.findById(input.eventId);
  if (!event) return { ok: false, error: "Event not found" };
  const closed = closedReason(event, await serverNow());
  if (closed) return { ok: false, error: closed };

  const attending = await repos.guests.listEventsByGuests([guestId]);
  if (!attending.get(guestId)?.some((e) => e.id === event.id)) {
    return { ok: false, error: "You are not attending this event" };
  }

  // Slots are derived, so the submitted starts are checked against the ones
  // the event actually offers: a hand-made payload must not be able to declare
  // a guest free at an instant that is not a slot at all.
  const offered = await eventSlotStarts(event);
  const declared = [...new Set(input.slotStarts)];
  if (declared.some((slot) => !offered.has(slot))) {
    return { ok: false, error: "Those slots are no longer available" };
  }

  await repos.meetingAvailability.replaceForGuest(
    guestId,
    event.id,
    declared.map((slot) => new Date(slot))
  );

  revalidatePath("/settings");
  return { ok: true };
}
