"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/db/container";
import { isAdminRequest } from "@/utils/acting-admin";
import type { AdminActionResult } from "./admin-guests";

export type LocationUnavailabilityInput = {
  eventId: string;
  locationId: string;
  /** UTC "yyyy-MM-ddTHH:mm", as the admin forms send. */
  start: string;
  end: string;
};

function parseDateTime(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value + "Z");
  return isNaN(d.getTime()) ? undefined : d;
}

async function revalidateEventPaths(eventId: string) {
  revalidatePath(`/admin/events/${eventId}/locations`);
  const event = await getRepositories().events.findById(eventId);
  if (event) revalidatePath(`/${event.slug}`, "layout");
}

export async function addLocationUnavailabilityAction(
  input: LocationUnavailabilityInput
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };

  const start = parseDateTime(input.start);
  const end = parseDateTime(input.end);
  if (!start || !end) return { ok: false, error: "Invalid start or end time" };
  if (end <= start) return { ok: false, error: "End must be after start" };

  const repos = getRepositories();
  const rooms = await repos.locations.listByEvent(input.eventId);
  if (!rooms.some((room) => room.id === input.locationId)) {
    return { ok: false, error: "That room is not part of this event" };
  }

  await repos.locationUnavailability.create({
    eventId: input.eventId,
    locationId: input.locationId,
    start,
    end,
  });
  await revalidateEventPaths(input.eventId);
  return { ok: true };
}

export async function deleteLocationUnavailabilityAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };

  const repos = getRepositories();
  const period = await repos.locationUnavailability.findById(input.id);
  if (!period) return { ok: false, error: "Not found" };

  await repos.locationUnavailability.delete(input.id);
  await revalidateEventPaths(period.eventId);
  return { ok: true };
}
