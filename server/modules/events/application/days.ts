import type { Day, Event } from "@schellingboard/domain/event";
import {
  dayAlignmentError,
  daysOverlap,
  sessionContainedInWindow,
} from "@schellingboard/domain/day-window";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  invalid,
  notFound,
  ok,
  versionConflict,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { EventDeps } from "../ports";
import { adminRequired, eventNotFound } from "./events";

export interface DayWindowInput {
  start: Date | undefined;
  end: Date | undefined;
  startBookings: Date | undefined;
  endBookings: Date | undefined;
}

type DayWindow = Pick<Day, "start" | "end" | "startBookings" | "endBookings">;

const dayNotFound = () => notFound("day.notFound", "Day not found");

async function dayChangedMeanwhile(
  repos: EventDeps["repos"],
  id: string
): Promise<Failure> {
  const current = await repos.days.findById(id);
  return current
    ? versionConflict(
        "day",
        current,
        "Someone changed this day while you edited it"
      )
    : dayNotFound();
}
const valid = (d: Date | undefined): d is Date =>
  d !== undefined && !isNaN(d.getTime());

function parseWindow(input: DayWindowInput): { data: DayWindow } | Failure {
  const { start, end, startBookings, endBookings } = input;
  const dateInvalid = (what: string) =>
    invalid("day.dateInvalid", `Invalid ${what} date/time`);
  const windowInvalid = (detail: string) =>
    invalid("day.windowInvalid", detail);

  if (!valid(start)) return dateInvalid("start");
  if (!valid(end)) return dateInvalid("end");
  if (end <= start) return windowInvalid("Day end must be after start");
  if (!valid(startBookings)) return dateInvalid("bookings start");
  if (!valid(endBookings)) return dateInvalid("bookings end");
  if (endBookings <= startBookings) {
    return windowInvalid("Bookings end must be after bookings start");
  }
  if (startBookings < start || endBookings > end) {
    return windowInvalid("Bookings window must be within the day window");
  }
  return { data: { start, end, startBookings, endBookings } };
}

async function placementError(
  repos: EventDeps["repos"],
  event: Event,
  window: DayWindow,
  ownId?: string
): Promise<Failure | null> {
  const alignmentError = dayAlignmentError(window, event.slotIncrementMinutes);
  if (alignmentError) return invalid("day.misaligned", alignmentError);

  const days = await repos.days.listByEvent(event.id);
  const overlaps = days.some(
    (d) =>
      d.id !== ownId && daysOverlap(window.start, window.end, d.start, d.end)
  );
  return overlaps
    ? conflict("day.overlap", "Day overlaps an existing day")
    : null;
}

export const createDay =
  ({ uow }: EventDeps) =>
  async (
    actor: Actor,
    input: DayWindowInput & ({ eventId: string } | { eventSlug: string })
  ): Promise<Result<Day>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseWindow(input);
    if (!("data" in parsed)) return parsed;
    return uow.run(async (tx) => {
      const event =
        "eventId" in input
          ? await tx.events.findById(input.eventId)
          : await tx.events.findBySlug(input.eventSlug);
      if (!event) return eventNotFound();
      const refused = await placementError(tx, event, parsed.data);
      if (refused) return refused;
      try {
        return ok(await tx.days.create({ ...parsed.data, eventId: event.id }));
      } catch {
        return conflict("day.saveFailed", "Failed to create day");
      }
    });
  };

export const updateDay =
  ({ uow }: EventDeps) =>
  async (
    actor: Actor,
    input: DayWindowInput & { id: string; expectedVersion?: number }
  ): Promise<Result<Day>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      const existing = await tx.days.findById(input.id);
      if (!existing) return dayNotFound();
      const parsed = parseWindow(input);
      if (!("data" in parsed)) return parsed;
      const window = parsed.data;
      const event = await tx.events.findById(existing.eventId);
      if (!event) return eventNotFound();
      const refused = await placementError(tx, event, window, existing.id);
      if (refused) return refused;

      // A session scheduled inside this day that the new window would leave out
      // becomes invalid and uneditable; the admin must move or delete it first.
      const sessions = await tx.sessions.listScheduledByEvent(existing.eventId);
      const orphaned = sessions.filter(
        (s) =>
          sessionContainedInWindow(s, existing.start, existing.end) &&
          !sessionContainedInWindow(s, window.start, window.end)
      );
      if (orphaned.length > 0) {
        const titles = orphaned.map((s) => `"${s.title}"`).join(", ");
        return conflict(
          "day.sessionsOutside",
          `Cannot resize this day: ${titles} would fall outside the new window. Reschedule or delete ${
            orphaned.length === 1 ? "it" : "them"
          } first.`
        );
      }

      let updated: Day | undefined;
      try {
        updated = await tx.days.update(input.id, {
          ...window,
          expectedVersion: input.expectedVersion,
        });
      } catch {
        return conflict("day.saveFailed", "Failed to update day");
      }
      return updated ? ok(updated) : dayChangedMeanwhile(tx, input.id);
    });
  };

export const deleteDay =
  ({ repos }: EventDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<Day>> => {
    if (!actor.admin) return adminRequired();
    const day = await repos.days.findById(input.id);
    if (!day) return dayNotFound();
    try {
      await repos.days.delete(input.id);
    } catch {
      return conflict("day.saveFailed", "Failed to delete day");
    }
    return ok(day);
  };
