import { changes } from "@schellingboard/domain/change";
import type { Event } from "@schellingboard/domain/event";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { byGuest } from "@/server/kernel/change-context";
import {
  conflict,
  forbidden,
  invalid,
  ok,
  type Result,
} from "@/server/kernel/result";
import { meetingsOpen } from "@/utils/meeting-rules";
import type { MeetingDeps } from "../ports";
import { attendees, closedFor, eventNotFound } from "./meetings";

export type MeetingNudgeState = {
  eventId: string;
  eventName: string;
  state: "canAsk" | "asked";
};

export const askToOpenUp =
  ({ repos, uow }: MeetingDeps) =>
  async (
    actor: Actor,
    input: { eventId: string; recipientId: string },
    now: Date
  ): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const askerId = acting.value;
    const { recipientId } = input;
    if (askerId === recipientId)
      return invalid("meeting.self", "You can't ask yourself");

    return uow.run(async (tx) => {
      const event = await tx.events.findById(input.eventId);
      if (!event) return eventNotFound();
      const closed = closedFor(event, now);
      if (closed) return closed;

      const attends = await attendees(tx, event.id, [askerId, recipientId]);
      if (!attends(askerId))
        return forbidden(
          "guest.notInEvent",
          "You are not attending this event"
        );
      if (!attends(recipientId))
        return invalid(
          "meeting.recipientNotInEvent",
          "They are not attending this event"
        );

      const declared = await tx.meetingAvailability.listByGuestAndEvent(
        recipientId,
        event.id
      );
      if (declared.some((slot) => slot > now))
        return invalid(
          "meeting.alreadyOpen",
          "They are already open to 1-on-1s"
        );

      const created = await tx.meetingNudges.create({
        eventId: event.id,
        askerId,
        recipientId,
        createdAt: now,
      });
      if (!created)
        return conflict(
          "meeting.alreadyAsked",
          "You already asked them to open up"
        );
      tx.record(
        changes.meetingNudged(
          event,
          askerId,
          recipientId,
          byGuest(askerId, now)
        )
      );
      return ok(undefined);
    });
  };

/** Per event the viewer shares with the guest, where the profile offers a nudge. */
export async function nudgeStatesFor(
  viewerId: string,
  recipientId: string,
  events: Event[],
  repos: MeetingDeps["repos"],
  now: Date
): Promise<MeetingNudgeState[]> {
  if (viewerId === recipientId) return [];
  const attending = await repos.guests.listEventsByGuests([
    viewerId,
    recipientId,
  ]);
  const theirs = new Set((attending.get(recipientId) ?? []).map((e) => e.id));
  const asked = new Set(
    await repos.meetingNudges.listEventsAsked(viewerId, recipientId)
  );

  const states: MeetingNudgeState[] = [];
  for (const { id } of attending.get(viewerId) ?? []) {
    const event = events.find((e) => e.id === id);
    if (!event || !theirs.has(id) || !meetingsOpen(event, now)) continue;
    const declared = await repos.meetingAvailability.listByGuestAndEvent(
      recipientId,
      id
    );
    if (declared.some((slot) => slot > now)) continue;
    states.push({
      eventId: id,
      eventName: event.name,
      state: asked.has(id) ? "asked" : "canAsk",
    });
  }
  return states;
}
