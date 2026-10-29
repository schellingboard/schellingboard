import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
import {
  clashesForInterval,
  loadGuestSchedules,
  type GuestClash,
} from "@/utils/guest-clashes";
import { availabilityFormsFor } from "@/utils/meeting-availability-form";
import { meetingOptionsFor, type MeetingOption } from "@/utils/meeting-options";
import { myMeetingsFor, type MyMeetingsResponse } from "@/utils/meeting-views";
import type { MeetingDeps } from "../ports";
import { eventNotFound } from "./meetings";

// Always the caller's own: a guest's meetings and free slots are as private as
// their RSVPs, so nothing here takes a guest to ask about.
export const listMyMeetings =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    { eventId }: { eventId: string },
    now: Date
  ): Promise<Result<MyMeetingsResponse>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    if (!(await repos.events.findById(eventId))) return eventNotFound();
    return ok(await myMeetingsFor(acting.value, eventId, now, repos));
  };

// Not an error without a chosen name: the profile then simply offers nothing.
export const listMeetingOptions =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    { guestId }: { guestId: string },
    now: Date
  ): Promise<Result<MeetingOption[]>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return ok([]);
    return ok(
      await meetingOptionsFor(
        acting.value,
        guestId,
        await repos.events.list(),
        repos,
        now
      )
    );
  };

// Site auth is shared with every attendee, so only an acting guest may ask:
// the reply reports when another guest is privately busy.
export const listHostClashes =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    input: {
      eventId: string;
      guestIds: string[];
      start: Date;
      end: Date;
      excludeSessionId?: string;
    }
  ): Promise<Result<GuestClash[]>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const event = await repos.events.findById(input.eventId);
    if (!event) return eventNotFound();
    const schedules = await loadGuestSchedules(event.id, input.guestIds, repos);
    return ok(
      clashesForInterval(schedules, {
        eventId: event.id,
        start: input.start,
        end: input.end,
        breakMinutes: event.breakMinutes,
        excludeSessionId: input.excludeSessionId,
      })
    );
  };

export const listAvailabilityForms =
  ({ repos }: MeetingDeps) =>
  async (actor: Actor, now: Date) => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    return ok(await availabilityFormsFor(acting.value, now, repos));
  };
