import { changes } from "@schellingboard/domain/change";
import { STALE_EVENT_MESSAGE } from "@schellingboard/contracts/event";
import type { Event } from "@schellingboard/domain/event";
import type { MeetingPoint } from "@schellingboard/domain/meeting";
import type { Actor } from "@/server/kernel/actor";
import { byAdmin } from "@/server/kernel/change-context";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  versionConflict,
  type Result,
} from "@/server/kernel/result";
import type { MeetingDeps } from "../ports";
import { eventNotFound } from "./meetings";

export interface EventMeetingsInput {
  eventId: string;
  meetingsEnabled: boolean;
  maxOpenMeetingRequests?: number;
  expectedVersion: number;
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
  ({ uow }: MeetingDeps) =>
  async (
    actor: Actor,
    input: EventMeetingsInput,
    now: Date
  ): Promise<Result<Event>> => {
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
    return uow.run(async (tx) => {
      const current = await tx.events.findById(input.eventId);
      if (!current) return eventNotFound();
      if (current.version !== input.expectedVersion)
        return versionConflict("event", current, STALE_EVENT_MESSAGE);
      const updated = await tx.events.update(input.eventId, {
        ...patch,
        expectedVersion: input.expectedVersion,
      });
      if (!updated) return eventNotFound();
      tx.record(
        changes.eventChanged(updated, { actor: { type: "admin" }, at: now })
      );
      return ok(updated);
    });
  };

export const createMeetingPoint =
  ({ uow }: MeetingDeps) =>
  async (
    actor: Actor,
    input: MeetingPointInput,
    now: Date
  ): Promise<Result<MeetingPoint>> => {
    if (!actor.admin) return adminRequired();
    const name = input.name.trim();
    if (!name) return nameRequired();
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();

      const existing = await tx.meetingPoints.listByEvent(input.eventId);
      const created = await tx.meetingPoints.create({
        eventId: input.eventId,
        name,
        description: input.description?.trim() ?? "",
        // Max rather than length, so the order survives a deletion.
        sortIndex:
          existing.reduce((max, p) => Math.max(max, p.sortIndex), -1) + 1,
      });
      tx.record(changes.meetingPointChanged(created, byAdmin(now)));
      return ok(created);
    });
  };

const pointNotFound = () =>
  notFound("meetingPoint.notFound", "Meeting point not found");

export const updateMeetingPoint =
  ({ uow }: MeetingDeps) =>
  async (
    actor: Actor,
    input: MeetingPointInput & { id: string; expectedVersion: number },
    now: Date
  ): Promise<Result<MeetingPoint>> => {
    if (!actor.admin) return adminRequired();
    const name = input.name.trim();
    if (!name) return nameRequired();
    return uow.run(async (tx) => {
      const current = (await tx.meetingPoints.listByEvent(input.eventId)).find(
        (p) => p.id === input.id
      );
      if (!current) return pointNotFound();
      if (current.version !== input.expectedVersion)
        return versionConflict(
          "meetingPoint",
          current,
          "Someone changed this meeting point while you edited it. Copy your edits somewhere safe: reloading the page discards them."
        );
      const updated = await tx.meetingPoints.update(input.id, {
        name,
        description: input.description?.trim() ?? "",
        expectedVersion: input.expectedVersion,
      });
      if (!updated) return pointNotFound();
      tx.record(changes.meetingPointChanged(updated, byAdmin(now)));
      return ok(updated);
    });
  };

export const deleteMeetingPoint =
  ({ uow }: MeetingDeps) =>
  async (
    actor: Actor,
    input: { eventId: string; id: string },
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      const point = (await tx.meetingPoints.listByEvent(input.eventId)).find(
        (p) => p.id === input.id
      );
      if (!point) return pointNotFound();
      await tx.meetingPoints.delete(point.id);
      tx.record(changes.meetingPointRemoved(point, byAdmin(now)));
      return ok(undefined);
    });
  };

export const listMeetingPoints =
  ({ repos }: MeetingDeps) =>
  async (actor: Actor, eventId: string): Promise<Result<MeetingPoint[]>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(eventId))) return eventNotFound();
    return ok(await repos.meetingPoints.listByEvent(eventId));
  };
