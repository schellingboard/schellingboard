import type { Event } from "@schellingboard/domain/event";
import type { MeetingPoint } from "@schellingboard/domain/meeting";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { MeetingDeps } from "../ports";
import { eventNotFound } from "./meetings";

export interface EventMeetingsInput {
  eventId: string;
  meetingsEnabled: boolean;
  maxOpenMeetingRequests?: number;
}

export interface MeetingPointInput {
  eventId: string;
  name: string;
  description?: string;
}

const adminRequired = () => forbidden("admin.required", "Unauthorized");
const nameRequired = () =>
  invalid("meetingPoint.nameRequired", "Name is required");

export const updateEventMeetings =
  ({ repos }: MeetingDeps) =>
  async (actor: Actor, input: EventMeetingsInput): Promise<Result<Event>> => {
    if (!actor.admin) return adminRequired();
    // The cap is hidden while meetings are off, so judging it then would leave
    // the organizer unable to switch meetings off over a field they cannot see.
    let patch:
      | { meetingsEnabled: false }
      | { meetingsEnabled: true; maxOpenMeetingRequests: number } = {
      meetingsEnabled: false,
    };
    if (input.meetingsEnabled) {
      const cap = input.maxOpenMeetingRequests;
      // Zero would leave meetings switched on but nobody able to ask for one.
      if (cap === undefined || !Number.isInteger(cap) || cap < 1)
        return invalid(
          "meeting.capInvalid",
          "Maximum open requests must be at least 1"
        );
      patch = { meetingsEnabled: true, maxOpenMeetingRequests: cap };
    }
    const updated = await repos.events.update(input.eventId, patch);
    return updated ? ok(updated) : eventNotFound();
  };

export const createMeetingPoint =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    input: MeetingPointInput
  ): Promise<Result<MeetingPoint>> => {
    if (!actor.admin) return adminRequired();
    const name = input.name.trim();
    if (!name) return nameRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();

    const existing = await repos.meetingPoints.listByEvent(input.eventId);
    return ok(
      await repos.meetingPoints.create({
        eventId: input.eventId,
        name,
        description: input.description?.trim() ?? "",
        // Max rather than length, so the order survives a deletion.
        sortIndex:
          existing.reduce((max, p) => Math.max(max, p.sortIndex), -1) + 1,
      })
    );
  };

// Scoped to the event named, so an id from elsewhere can't reach another
// event's points.
async function missingPoint(
  repos: MeetingDeps["repos"],
  { eventId, id }: { eventId: string; id: string }
): Promise<Failure | null> {
  const points = await repos.meetingPoints.listByEvent(eventId);
  return points.some((p) => p.id === id)
    ? null
    : notFound("meetingPoint.notFound", "Meeting point not found");
}

export const updateMeetingPoint =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    input: MeetingPointInput & { id: string }
  ): Promise<Result<MeetingPoint>> => {
    if (!actor.admin) return adminRequired();
    const name = input.name.trim();
    if (!name) return nameRequired();
    const missing = await missingPoint(repos, input);
    if (missing) return missing;
    const updated = await repos.meetingPoints.update(input.id, {
      name,
      description: input.description?.trim() ?? "",
    });
    return updated
      ? ok(updated)
      : notFound("meetingPoint.notFound", "Meeting point not found");
  };

export const deleteMeetingPoint =
  ({ repos }: MeetingDeps) =>
  async (
    actor: Actor,
    input: { eventId: string; id: string }
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    const missing = await missingPoint(repos, input);
    if (missing) return missing;
    await repos.meetingPoints.delete(input.id);
    return ok(undefined);
  };
