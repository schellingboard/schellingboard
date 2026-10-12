import { z } from "zod";
import {
  locationSchema,
  updateLocationSchema,
} from "@schellingboard/contracts/location";
import { changes } from "@schellingboard/domain/change";
import type { Location } from "@schellingboard/domain/location";
import type { Actor } from "@/server/kernel/actor";
import { recordingSessionCascade } from "@/server/kernel/session-cascade";
import type { Tx } from "@/server/kernel/unit-of-work";
import { withStoredFile } from "@/server/kernel/stored-files";
import {
  forbidden,
  invalid,
  invalidFields,
  notFound,
  ok,
  versionConflict,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { VenueDeps } from "../ports";
import {
  byAdmin,
  recordLocationChanged,
  recordLocationRemoved,
} from "./location-changes";

export type LocationWithEvents = Location & { eventIds: string[] };

export const adminRequired = () => forbidden("admin.required", "Unauthorized");
export const locationNotFound = () =>
  notFound("location.notFound", "Location not found");
export const eventNotFound = () =>
  notFound("event.notFound", "Event not found");

async function locationChangedMeanwhile(
  locations: VenueDeps["repos"]["locations"],
  id: string
): Promise<Failure> {
  const current = await locations.findById(id);
  return current
    ? versionConflict(
        "location",
        { ...current, eventIds: await locations.listEventIds(id) },
        "Someone changed this location while you edited it. Copy your edits somewhere safe: reloading the page discards them."
      )
    : locationNotFound();
}

const outdated = (location: Location, expectedVersion: number) =>
  location.version !== expectedVersion;

// The image is checked before anything is stored, so a bad upload doesn't
// leave a half-created location behind.
function validations({ repos, images }: VenueDeps) {
  const knownEvents = async (eventIds: string[]) => {
    const known = new Set((await repos.events.list()).map((e) => e.id));
    return eventIds.every((id) => known.has(id));
  };
  const prepareImage = async (
    image: Blob | null | undefined,
    ctx: z.core.$RefinementCtx<Blob | null | undefined>
  ) => {
    if (!image) return;
    const checked = await images.validate(
      Buffer.from(await image.arrayBuffer())
    );
    if ("error" in checked) {
      ctx.addIssue({ code: "custom", message: checked.error });
      return z.NEVER;
    }
    return checked;
  };
  return {
    eventIds: locationSchema.shape.eventIds.refine(knownEvents, {
      message: "Unknown event",
    }),
    image: locationSchema.shape.image.transform(prepareImage),
  } as const;
}

function refused(error: z.ZodError) {
  return invalidFields(
    "location.invalid",
    error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }))
  );
}

// Checked again inside the transaction: an event deleted since the form was
// validated would otherwise fail the insert.
async function unknownEvent(
  events: VenueDeps["repos"]["events"],
  eventIds: string[]
) {
  const known = new Set((await events.list()).map((e) => e.id));
  return eventIds.every((id) => known.has(id))
    ? null
    : invalidFields("location.invalid", [
        { path: "eventIds", message: "Unknown event" },
      ]);
}

export const createLocation =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    input: unknown,
    now: Date
  ): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const by = byAdmin(now);
    const parsed = await locationSchema
      .extend({ ...validations(deps), eventSlug: z.string().optional() })
      .safeParseAsync(input);
    if (!parsed.success) return refused(parsed.error);
    const { image, eventIds: requested, eventSlug, ...fields } = parsed.data;

    const created = await deps.uow.run(async (tx) => {
      const bySlug = eventSlug
        ? await tx.events.findBySlug(eventSlug)
        : undefined;
      if (eventSlug && !bySlug) return eventNotFound();
      const eventIds = [
        ...new Set([...requested, ...(bySlug ? [bySlug.id] : [])]),
      ];
      const unknown = await unknownEvent(tx.events, eventIds);
      if (unknown) return unknown;

      const existing = await tx.locations.list();
      const sortIndex =
        existing.length === 0
          ? 0
          : Math.max(...existing.map((l) => l.sortIndex)) + 1;
      const location = await tx.locations.create({
        ...fields,
        imageUrl: "",
        sortIndex,
      });
      await tx.locations.setEventIds(location.id, eventIds);
      const saved = await tx.locations.findById(location.id);
      if (!saved) throw new Error("Failed to create location");
      await recordLocationChanged(tx, saved.id, eventIds, by);
      return ok({ ...saved, eventIds });
    });
    if (!created.ok || !image) return created;

    // Saved after the commit, as the file is named by the location's id. A
    // failed save leaves the location without an image.
    const { id, eventIds } = created.value;
    const imageUrl = await deps.images.saveNew(id, image.buffer, image.ext);
    return withStoredFile(deps.images, imageUrl, (replaces) =>
      deps.uow.run(async (tx) => {
        const location = await tx.locations.findById(id);
        if (!location) return locationNotFound();
        const updated = await tx.locations.update(id, {
          ...location,
          imageUrl,
        });
        if (!updated) return locationNotFound();
        replaces(location.imageUrl);
        await recordLocationChanged(tx, id, eventIds, by);
        return ok({ ...updated, eventIds });
      })
    );
  };

export const updateLocation =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    input: unknown,
    now: Date
  ): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const by = byAdmin(now);
    const parsed = await updateLocationSchema
      .extend(validations(deps))
      .safeParseAsync(input);
    if (!parsed.success) return refused(parsed.error);
    const {
      image,
      id,
      eventIds: requested,
      expectedVersion,
      ...fields
    } = parsed.data;
    const eventIds = [...new Set(requested)];
    const newImageUrl = image
      ? await deps.images.saveNew(id, image.buffer, image.ext)
      : null;

    return withStoredFile(deps.images, newImageUrl, (replaces) =>
      deps.uow.run(async (tx) => {
        const existing = await tx.locations.findById(id);
        if (!existing) return locationNotFound();
        const unknown = await unknownEvent(tx.events, eventIds);
        if (unknown) return unknown;
        const wasIn = await tx.locations.listEventIds(id);

        const updated = await tx.locations.update(id, {
          ...fields,
          imageUrl: newImageUrl ?? existing.imageUrl,
          sortIndex: existing.sortIndex,
          eventIds,
          expectedVersion,
        });
        if (!updated) return locationChangedMeanwhile(tx.locations, id);
        if (newImageUrl) replaces(existing.imageUrl);
        await recordLocationChanged(tx, id, eventIds, by);
        recordLocationRemoved(
          tx,
          updated,
          wasIn.filter((e) => !eventIds.includes(e)),
          by
        );
        return ok({ ...updated, eventIds });
      })
    );
  };

function setImageUrl(
  { uow, images }: VenueDeps,
  id: string,
  imageUrl: string,
  expectedVersion: number,
  now: Date
): Promise<Result<LocationWithEvents>> {
  return withStoredFile(images, imageUrl || null, (replaces) =>
    uow.run(async (tx) => {
      const existing = await tx.locations.findById(id);
      if (!existing) return locationNotFound();
      const updated = await tx.locations.update(id, {
        ...existing,
        imageUrl,
        expectedVersion,
      });
      if (!updated) return locationChangedMeanwhile(tx.locations, id);
      replaces(existing.imageUrl);
      const eventIds = await tx.locations.listEventIds(id);
      await recordLocationChanged(tx, id, eventIds, byAdmin(now));
      return ok({ ...updated, eventIds });
    })
  );
}

export const replaceLocationImage =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    {
      id,
      image,
      expectedVersion,
    }: { id: string; image: Buffer; expectedVersion: number },
    now: Date
  ): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const checked = await deps.images.validate(image);
    if ("error" in checked)
      return invalid("location.imageInvalid", checked.error);
    const imageUrl = await deps.images.saveNew(id, checked.buffer, checked.ext);
    return setImageUrl(deps, id, imageUrl, expectedVersion, now);
  };

export const removeLocationImage =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    { id, expectedVersion }: { id: string; expectedVersion: number },
    now: Date
  ): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    return setImageUrl(deps, id, "", expectedVersion, now);
  };

export const deleteLocation =
  ({ uow, images }: VenueDeps) =>
  async (
    actor: Actor,
    input: { id: string },
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    const by = byAdmin(now);
    return withStoredFile(images, null, (replaces) =>
      uow.run(async (tx) => {
        const location = await tx.locations.findById(input.id);
        if (!location) return locationNotFound();
        const eventIds = await tx.locations.listEventIds(input.id);
        const periods = await periodsOf(tx, input.id);
        const using = (await tx.sessions.list()).filter((s) =>
          s.locations.some((l) => l.id === input.id)
        );
        await recordingSessionCascade(
          tx,
          using,
          () => tx.locations.delete(input.id),
          by
        );
        for (const period of periods)
          tx.record(changes.unavailabilityRemoved(period, by));
        recordLocationRemoved(tx, location, eventIds, by);
        replaces(location.imageUrl);
        return ok(undefined);
      })
    );
  };

export const moveLocation =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    input: { id: string; direction: "up" | "down"; expectedVersion: number },
    now: Date
  ): Promise<Result<LocationWithEvents[]>> => {
    if (!actor.admin) return adminRequired();
    const moved = await deps.uow.run(async (tx) => {
      const location = await tx.locations.findById(input.id);
      if (!location) return locationNotFound();
      if (outdated(location, input.expectedVersion))
        return locationChangedMeanwhile(tx.locations, input.id);
      const before = new Map((await tx.locations.list()).map((l) => [l.id, l]));
      await tx.locations.move(input.id, input.direction);
      for (const after of await tx.locations.list()) {
        const was = before.get(after.id);
        if (was?.sortIndex !== after.sortIndex || was.version !== after.version)
          await recordLocationChanged(
            tx,
            after.id,
            await tx.locations.listEventIds(after.id),
            byAdmin(now)
          );
      }
      return ok(undefined);
    });
    return moved.ok ? listLocations(deps)(actor, {}) : moved;
  };

export const listLocations =
  ({ repos }: VenueDeps) =>
  async (
    actor: Actor,
    input: { eventId?: string }
  ): Promise<Result<LocationWithEvents[]>> => {
    if (!actor.admin) return adminRequired();
    if (input.eventId && !(await repos.events.findById(input.eventId))) {
      return eventNotFound();
    }
    const locations = input.eventId
      ? await repos.locations.listByEvent(input.eventId)
      : await repos.locations.list();
    const eventIds = await repos.locations.listEventIdsByLocations(
      locations.map((l) => l.id)
    );
    return ok(
      locations.map((l) => ({ ...l, eventIds: eventIds.get(l.id) ?? [] }))
    );
  };

// A location's closed periods go with it, in every event.
async function periodsOf(tx: Tx, locationId: string) {
  const events = await tx.events.list();
  const lists = await Promise.all(
    events.map((e) => tx.locationUnavailability.listByEvent(e.id))
  );
  return lists.flat().filter((p) => p.locationId === locationId);
}
