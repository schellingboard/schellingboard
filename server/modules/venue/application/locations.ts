import { z } from "zod";
import {
  locationSchema,
  updateLocationSchema,
} from "@schellingboard/contracts/location";
import type { Location } from "@schellingboard/domain/location";
import type { Actor } from "@/server/kernel/actor";
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
  async (actor: Actor, input: unknown): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
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
      return ok({ ...saved, eventIds });
    });
    if (!created.ok || !image) return created;

    // Saved after the commit, as the file is named by the location's id. A
    // failed save leaves the location without an image.
    const { id, eventIds } = created.value;
    const imageUrl = await deps.images.save(id, image.buffer, image.ext);
    const updated = await deps.uow.run(async (tx) => {
      const location = await tx.locations.findById(id);
      return location && tx.locations.update(id, { ...location, imageUrl });
    });
    if (updated) return ok({ ...updated, eventIds });
    await deps.images.delete(id);
    return locationNotFound();
  };

export const updateLocation =
  (deps: VenueDeps) =>
  async (actor: Actor, input: unknown): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
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

    const saved = await saveImageIfCurrent(deps, id, expectedVersion, image);
    if (!saved.ok) return saved;
    const newImageUrl = saved.value;

    const updated = await deps.uow.run(async (tx) => {
      const existing = await tx.locations.findById(id);
      if (!existing) return locationNotFound();
      const unknown = await unknownEvent(tx.events, eventIds);
      if (unknown) return unknown;

      const updated = await tx.locations.update(id, {
        ...fields,
        imageUrl: newImageUrl ?? existing.imageUrl,
        sortIndex: existing.sortIndex,
        eventIds,
        expectedVersion,
      });
      if (!updated) return locationChangedMeanwhile(tx.locations, id);
      return ok({ ...updated, eventIds });
    });
    return dropOrphanedImage(deps, id, updated, newImageUrl);
  };

// Checked before the file is replaced, so a stale save replaces no file. The
// check is not atomic with the write: a save conflicting in between keeps its file.
async function saveImageIfCurrent(
  { repos, images }: VenueDeps,
  id: string,
  expectedVersion: number,
  image: { buffer: Buffer; ext: string } | undefined
): Promise<Result<string | undefined>> {
  const found = await repos.locations.findById(id);
  if (!found) return locationNotFound();
  if (outdated(found, expectedVersion))
    return locationChangedMeanwhile(repos.locations, id);
  return ok(image && (await images.save(id, image.buffer, image.ext)));
}

async function dropOrphanedImage<T>(
  { images }: VenueDeps,
  id: string,
  result: Result<T>,
  savedImageUrl: string | undefined
): Promise<Result<T>> {
  if (!result.ok && result.error.code === "location.notFound" && savedImageUrl)
    await images.delete(id);
  return result;
}

async function setImageUrl(
  { uow }: VenueDeps,
  id: string,
  imageUrl: string,
  expectedVersion: number
): Promise<Result<LocationWithEvents>> {
  return uow.run(async (tx) => {
    const existing = await tx.locations.findById(id);
    if (!existing) return locationNotFound();
    const updated = await tx.locations.update(id, {
      ...existing,
      imageUrl,
      expectedVersion,
    });
    if (!updated) return locationChangedMeanwhile(tx.locations, id);
    return ok({ ...updated, eventIds: await tx.locations.listEventIds(id) });
  });
}

export const replaceLocationImage =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    {
      id,
      image,
      expectedVersion,
    }: { id: string; image: Buffer; expectedVersion: number }
  ): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const checked = await deps.images.validate(image);
    if ("error" in checked)
      return invalid("location.imageInvalid", checked.error);
    const saved = await saveImageIfCurrent(deps, id, expectedVersion, checked);
    if (!saved.ok) return saved;
    const imageUrl = saved.value ?? "";
    return dropOrphanedImage(
      deps,
      id,
      await setImageUrl(deps, id, imageUrl, expectedVersion),
      imageUrl
    );
  };

export const removeLocationImage =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    { id, expectedVersion }: { id: string; expectedVersion: number }
  ): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const removed = await setImageUrl(deps, id, "", expectedVersion);
    if (removed.ok) await deps.images.delete(id);
    return removed;
  };

export const deleteLocation =
  ({ repos, images }: VenueDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.locations.findById(input.id))) return locationNotFound();
    await repos.locations.delete(input.id);
    await images.delete(input.id);
    return ok(undefined);
  };

export const moveLocation =
  (deps: VenueDeps) =>
  async (
    actor: Actor,
    input: { id: string; direction: "up" | "down"; expectedVersion: number }
  ): Promise<Result<LocationWithEvents[]>> => {
    if (!actor.admin) return adminRequired();
    const moved = await deps.uow.run(async (tx) => {
      const location = await tx.locations.findById(input.id);
      if (!location) return locationNotFound();
      if (outdated(location, input.expectedVersion))
        return locationChangedMeanwhile(tx.locations, input.id);
      await tx.locations.move(input.id, input.direction);
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
