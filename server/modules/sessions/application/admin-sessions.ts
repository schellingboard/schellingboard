import type { Session } from "@schellingboard/domain/session";
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
import type { SessionDeps } from "../ports";

export interface AdminSessionFields {
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  hostIds: string[];
  locationIds: string[];
}

export interface AdminCreateSessionInput extends AdminSessionFields {
  eventId: string;
}

export interface AdminUpdateSessionInput extends AdminSessionFields {
  id: string;
}

type Checked = Omit<AdminSessionFields, "startTime" | "endTime"> & {
  startTime: Date | undefined;
  endTime: Date | undefined;
};

const adminRequired = () => forbidden("admin.required", "Unauthorized");
const sessionNotFound = () => notFound("session.notFound", "Session not found");

// Times must form a valid interval: both set (end after start) or both empty.
function checked(input: AdminSessionFields): Result<Checked> {
  const title = input.title.trim();
  if (!title) return invalid("session.titleRequired", "Title is required");
  const { startTime, endTime } = input;
  let range: { startTime?: Date; endTime?: Date } = {};
  if (startTime || endTime) {
    if (!startTime || !endTime)
      return invalid(
        "session.timeRangeInvalid",
        "Start and end time must both be set or both empty"
      );
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return invalid("session.timeRangeInvalid", "Invalid start or end time");
    if (end <= start)
      return invalid(
        "session.timeRangeInvalid",
        "End time must be after start time"
      );
    range = { startTime: start, endTime: end };
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 0)
    return invalid(
      "session.capacityInvalid",
      "Capacity must be a non-negative whole number"
    );
  return ok({
    title,
    description: input.description.trim(),
    // Present even when unset: an update clears the times then.
    startTime: range.startTime,
    endTime: range.endTime,
    capacity: input.capacity,
    adminManaged: input.adminManaged,
    blocker: input.blocker,
    closed: input.closed,
    hostIds: input.hostIds,
    locationIds: input.locationIds,
  });
}

// The rule attendees book by too: two sessions conflict when they share a
// location and their times overlap.
async function clash(
  repos: SessionDeps["repos"],
  eventId: string,
  fields: Checked,
  excludeId?: string
): Promise<Failure | null> {
  const { startTime, endTime, locationIds } = fields;
  if (!startTime || !endTime || locationIds.length === 0) return null;
  const found = await repos.sessions.findLocationConflict(
    eventId,
    startTime,
    endTime,
    locationIds,
    excludeId
  );
  return found
    ? conflict(
        "session.clash",
        `Overlaps "${found.title}" in the same location`
      )
    : null;
}

export const adminCreateSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    { eventId, ...input }: AdminCreateSessionInput,
    now: Date
  ): Promise<Result<Session>> => {
    if (!actor.admin) return adminRequired();
    const fields = checked(input);
    if (!fields.ok) return fields;
    const { repos } = deps;
    if (!(await repos.events.findById(eventId)))
      return notFound("event.notFound", "Event not found");
    const clashing = await clash(repos, eventId, fields.value);
    if (clashing) return clashing;

    const created = await repos.sessions.create({ ...fields.value, eventId });
    await deps.notifyCohostsAdded({
      now,
      session: created,
      previousHostIds: [],
      changedById: null,
    });
    return ok(created);
  };

export const adminUpdateSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    { id, ...input }: AdminUpdateSessionInput,
    now: Date
  ): Promise<Result<Session>> => {
    if (!actor.admin) return adminRequired();
    const fields = checked(input);
    if (!fields.ok) return fields;
    const { repos } = deps;
    const session = await repos.sessions.findById(id);
    if (!session) return sessionNotFound();
    const clashing = await clash(repos, session.eventId, fields.value, id);
    if (clashing) return clashing;

    const updated = await repos.sessions.update(id, fields.value, {
      actor: { type: "admin" },
      at: now,
    });
    await deps.notifyCohostsAdded({
      now,
      session: updated,
      previousHostIds: session.hosts.map((h) => h.id),
      changedById: null,
    });
    deps.nudgeJobs();
    return ok(updated);
  };

export const adminDeleteSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    { id }: { id: string },
    now: Date
  ): Promise<Result<Session>> => {
    if (!actor.admin) return adminRequired();
    const { repos } = deps;
    const session = await repos.sessions.findById(id);
    if (!session) return sessionNotFound();
    await repos.sessions.delete(id, { actor: { type: "admin" }, at: now });
    deps.nudgeJobs();
    return ok(session);
  };
