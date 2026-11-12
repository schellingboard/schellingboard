import type { Event, SharedMoment } from "@schellingboard/domain/event";
import { dayTimeToUtc } from "@schellingboard/domain/admin-datetime";
import type { Actor } from "@/server/kernel/actor";
import {
  invalidFields,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { EventDeps } from "../ports";
import { adminRequired, eventNotFound } from "./events";

export interface MomentInput {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

const momentNotFound = () => notFound("moment.notFound", "Moment not found");
const dayNotFound = () => notFound("day.notFound", "Day not found");

function refusal(code: string, path: string, message: string): Failure {
  return invalidFields(code, [{ path, message }]);
}

function momentOn(
  day: { start: Date; end: Date },
  event: Event,
  input: MomentInput
): { data: Pick<SharedMoment, "start" | "end"> } | Failure {
  const range = {
    start: day.start.toISOString(),
    end: day.end.toISOString(),
  };
  const start = new Date(dayTimeToUtc(range, input.startTime, event.timezone));
  const end = new Date(dayTimeToUtc(range, input.endTime, event.timezone));
  if (isNaN(start.getTime()))
    return refusal("moment.timeInvalid", "startTime", "Start time is invalid");
  if (isNaN(end.getTime()))
    return refusal("moment.timeInvalid", "endTime", "End time is invalid");
  if (end <= start)
    return refusal(
      "moment.windowInvalid",
      "endTime",
      "End must be after start"
    );
  if (start < day.start || end > day.end)
    return refusal(
      "moment.outsideDay",
      start < day.start ? "startTime" : "endTime",
      "A moment must lie within its day's time window"
    );
  return { data: { start, end } };
}

function textOf(input: MomentInput): Failure | null {
  return input.title.trim()
    ? null
    : refusal("moment.titleRequired", "title", "Title is required");
}

export const createMoments =
  ({ uow }: EventDeps) =>
  async (
    actor: Actor,
    input: MomentInput & { eventId: string; dayIds: string[] }
  ): Promise<Result<SharedMoment[]>> => {
    if (!actor.admin) return adminRequired();
    const dayIds = [...new Set(input.dayIds)];
    if (dayIds.length === 0)
      return refusal("moment.daysRequired", "dayIds", "Pick at least one day");
    const refused = textOf(input);
    if (refused) return refused;
    return uow.run(async (tx) => {
      const event = await tx.events.findById(input.eventId);
      if (!event) return eventNotFound();
      const days = await tx.days.listByEvent(event.id);
      const rows: Omit<SharedMoment, "id">[] = [];
      for (const dayId of dayIds) {
        const day = days.find((d) => d.id === dayId);
        if (!day) return dayNotFound();
        const placed = momentOn(day, event, input);
        if (!("data" in placed)) return placed;
        rows.push({
          dayId,
          title: input.title.trim(),
          description: input.description.trim(),
          ...placed.data,
        });
      }
      return ok(await tx.sharedMoments.createMany(rows));
    });
  };

export const updateMoment =
  ({ uow }: EventDeps) =>
  async (
    actor: Actor,
    input: MomentInput & { id: string }
  ): Promise<Result<SharedMoment>> => {
    if (!actor.admin) return adminRequired();
    const refused = textOf(input);
    if (refused) return refused;
    return uow.run(async (tx) => {
      const existing = await tx.sharedMoments.findById(input.id);
      if (!existing) return momentNotFound();
      const day = await tx.days.findById(existing.dayId);
      const event = day && (await tx.events.findById(day.eventId));
      if (!day || !event) return dayNotFound();
      const placed = momentOn(day, event, input);
      if (!("data" in placed)) return placed;
      const updated = await tx.sharedMoments.update(input.id, {
        title: input.title.trim(),
        description: input.description.trim(),
        ...placed.data,
      });
      return updated ? ok(updated) : momentNotFound();
    });
  };

export const deleteMoment =
  ({ uow }: EventDeps) =>
  async (
    actor: Actor,
    input: { id: string }
  ): Promise<Result<SharedMoment>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      const existing = await tx.sharedMoments.findById(input.id);
      if (!existing) return momentNotFound();
      await tx.sharedMoments.delete(input.id);
      return ok(existing);
    });
  };
