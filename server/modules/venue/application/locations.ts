import { z } from "zod";
import {
  locationSchema,
  updateLocationSchema,
} from "@schellingboard/contracts/location";
import type { Location } from "@schellingboard/domain/location";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalidFields,
  notFound,
  ok,
  type Result,
} from "@/server/kernel/result";
import type { VenueDeps } from "../ports";

export type LocationWithEvents = Location & { eventIds: string[] };

export const adminRequired = () => forbidden("admin.required", "Unauthorized");
export const locationNotFound = () =>
  notFound("location.notFound", "Location not found");
export const eventNotFound = () =>
  notFound("event.notFound", "Event not found");

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

export const createLocation =
  (deps: VenueDeps) =>
  async (actor: Actor, input: unknown): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const parsed = await locationSchema
      .extend({ ...validations(deps), eventSlug: z.string().optional() })
      .safeParseAsync(input);
    if (!parsed.success) return refused(parsed.error);
    const { image, eventIds: requested, eventSlug, ...fields } = parsed.data;
    const { locations, events } = deps.repos;
    const bySlug = eventSlug ? await events.findBySlug(eventSlug) : undefined;
    if (eventSlug && !bySlug)
      return notFound("event.notFound", "Event not found");
    const eventIds = [
      ...new Set([...requested, ...(bySlug ? [bySlug.id] : [])]),
    ];

    const existing = await locations.list();
    const sortIndex =
      existing.length === 0
        ? 0
        : Math.max(...existing.map((l) => l.sortIndex)) + 1;
    let location = await locations.create({
      ...fields,
      imageUrl: "",
      sortIndex,
    });
    if (image) {
      const imageUrl = await deps.images.save(
        location.id,
        image.buffer,
        image.ext
      );
      location =
        (await locations.update(location.id, { ...location, imageUrl })) ??
        location;
    }
    await locations.setEventIds(location.id, eventIds);
    return ok({ ...location, eventIds });
  };

export const updateLocation =
  (deps: VenueDeps) =>
  async (actor: Actor, input: unknown): Promise<Result<LocationWithEvents>> => {
    if (!actor.admin) return adminRequired();
    const parsed = await updateLocationSchema
      .extend(validations(deps))
      .safeParseAsync(input);
    if (!parsed.success) return refused(parsed.error);
    const { image, id, eventIds: requested, ...fields } = parsed.data;
    const eventIds = [...new Set(requested)];

    const { locations } = deps.repos;
    const existing = await locations.findById(id);
    if (!existing) return locationNotFound();

    const imageUrl = image
      ? await deps.images.save(id, image.buffer, image.ext)
      : existing.imageUrl;
    const updated = await locations.update(id, {
      ...fields,
      imageUrl,
      sortIndex: existing.sortIndex,
    });
    if (!updated) return locationNotFound();
    await locations.setEventIds(id, eventIds);
    return ok({ ...updated, eventIds });
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
  ({ repos }: VenueDeps) =>
  async (
    actor: Actor,
    input: { id: string; direction: "up" | "down" }
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.locations.findById(input.id))) return locationNotFound();
    await repos.locations.move(input.id, input.direction);
    return ok(undefined);
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
