import type { ChangeContext } from "@schellingboard/domain/change";
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
import { changedMeanwhile } from "./booking";
import { changeSession, removeSession } from "./session-changes";

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
  expectedVersion?: number;
}

type Checked = Omit<AdminSessionFields, "startTime" | "endTime"> & {
  startTime: Date | undefined;
  endTime: Date | undefined;
};

export interface AdminSeedSessionInput {
  eventSlug: string;
  title: string;
  description: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  hostIds: string[];
  locationIds: string[];
  /** Unset takes the first location's capacity. */
  capacity?: number;
  adminManaged: boolean;
  closed: boolean;
}

const adminRequired = () => forbidden("admin.required", "Unauthorized");
const capacityInvalid = () =>
  invalid(
    "session.capacityInvalid",
    "Capacity must be a non-negative whole number"
  );
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
    return capacityInvalid();
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

async function unknownReference(
  repos: SessionDeps["repos"],
  { hostIds, locationIds }: Pick<AdminSessionFields, "hostIds" | "locationIds">
): Promise<Failure | null> {
  const knownHosts = await repos.guests.findExistingIds(hostIds);
  if (knownHosts.length !== hostIds.length)
    return invalid("session.hostUnknown", "Unknown host");
  const knownLocations = await repos.locations.findExistingIds(locationIds);
  if (knownLocations.length !== locationIds.length)
    return invalid("session.locationUnknown", "Unknown location");
  return null;
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
    const unknown = await unknownReference(repos, fields.value);
    if (unknown) return unknown;
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
    { id, expectedVersion, ...input }: AdminUpdateSessionInput,
    now: Date
  ): Promise<Result<Session>> => {
    if (!actor.admin) return adminRequired();
    const fields = checked(input);
    if (!fields.ok) return fields;
    const { repos } = deps;
    const session = await repos.sessions.findById(id);
    if (!session) return sessionNotFound();
    const unknown = await unknownReference(repos, fields.value);
    if (unknown) return unknown;
    const clashing = await clash(repos, session.eventId, fields.value, id);
    if (clashing) return clashing;

    const by: ChangeContext = { actor: { type: "admin" }, at: now };
    const updated = await deps.uow.run((tx) =>
      changeSession(tx, id, { ...fields.value, expectedVersion }, by)
    );
    if (!updated) return changedMeanwhile(repos, id);
    await deps.notifyCohostsAdded({
      now,
      session: updated,
      previousHostIds: session.hosts.map((h) => h.id),
      changedById: null,
    });
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
    const by: ChangeContext = { actor: { type: "admin" }, at: now };
    await deps.uow.run((tx) => removeSession(tx, id, by));
    return ok(session);
  };

const isDate = (d: Date | undefined): d is Date =>
  d !== undefined && !Number.isNaN(d.getTime());

// For seeding scripts, which import past and fixed times: no phase, booking
// window or notification applies, and the hosts and rooms join the event.
export const adminSeedSession =
  ({ repos }: SessionDeps) =>
  async (
    actor: Actor,
    input: AdminSeedSessionInput
  ): Promise<Result<Session>> => {
    if (!actor.admin) return adminRequired();
    const title = input.title.trim();
    if (!title) return invalid("session.titleRequired", "Title is required");
    const { startTime, endTime, hostIds, locationIds } = input;
    const timeInvalid = (detail: string) =>
      invalid("session.timeRangeInvalid", detail);
    if (!isDate(startTime)) return timeInvalid("Invalid start time");
    if (!isDate(endTime)) return timeInvalid("Invalid end time");
    if (endTime <= startTime)
      return timeInvalid("End time must be after start time");

    const event = await repos.events.findBySlug(input.eventSlug);
    if (!event) return notFound("event.notFound", "Event not found");
    const unknown = await unknownReference(repos, input);
    if (unknown) return unknown;
    const capacity =
      input.capacity !== undefined
        ? input.capacity
        : ((locationIds.length > 0
            ? (await repos.locations.findById(locationIds[0]))?.capacity
            : undefined) ?? 0);
    if (!Number.isInteger(capacity) || capacity < 0) return capacityInvalid();

    const fields: Checked = {
      title,
      description: input.description.trim(),
      startTime,
      endTime,
      capacity,
      adminManaged: input.adminManaged,
      blocker: false,
      closed: input.closed,
      hostIds,
      locationIds,
    };
    const clashing = await clash(repos, event.id, fields);
    if (clashing) return clashing;

    const created = await repos.sessions.create({
      ...fields,
      eventId: event.id,
    });
    if (hostIds.length > 0) await repos.guests.assignToEvent(event.id, hostIds);
    if (locationIds.length > 0)
      await repos.locations.assignToEvent(event.id, locationIds);
    return ok(created);
  };
