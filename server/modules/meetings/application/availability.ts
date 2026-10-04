import { meetingSlotsForDay } from "@schellingboard/domain/meeting-slots";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, invalid, ok, type Result } from "@/server/kernel/result";
import type { MeetingDeps } from "../ports";
import { attendees, closedFor, eventNotFound } from "./meetings";

export const saveMeetingAvailability =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    input: { eventId: string; slotStarts: string[] },
    now: Date
  ): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const guestId = acting.value;

    const event = await repos.events.findById(input.eventId);
    if (!event) return eventNotFound();
    const closed = closedFor(event, now);
    if (closed) return closed;
    if (!(await attendees(repos, event.id, [guestId]))(guestId))
      return forbidden("guest.notInEvent", "You are not attending this event");

    // Slots are derived, so a hand-made payload must not be able to declare a
    // guest free at an instant that is not a slot at all.
    const days = await repos.days.listByEvent(event.id);
    const offered = new Set(
      days.flatMap((day) =>
        meetingSlotsForDay(day, event.slotIncrementMinutes).map((slot) =>
          slot.start.toISOString()
        )
      )
    );
    const declared = [...new Set(input.slotStarts)];
    if (declared.some((slot) => !offered.has(slot)))
      return invalid(
        "meeting.slotsUnavailable",
        "Those slots are no longer available"
      );

    await repos.meetingAvailability.replaceForGuest(
      guestId,
      event.id,
      declared.map((slot) => new Date(slot))
    );
    return ok(undefined);
  };
