import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
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
