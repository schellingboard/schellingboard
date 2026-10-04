"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eventUseCases, sessionUseCases } from "@/server/composition";
import { resolveActor, type Actor } from "@/server/kernel/actor";
import type { AdminActionResult } from "./admin-guests";

export type LocationUnavailabilityInput = {
  eventId: string;
  locationIds: string[];
  /** UTC "yyyy-MM-ddTHH:mm", as the admin forms send. */
  start: string;
  end: string;
};

function parseDateTime(value: string): Date | undefined {
  return value ? new Date(value + "Z") : undefined;
}

async function revalidateEventPaths(actor: Actor, eventId: string) {
  revalidatePath(`/admin/events/${eventId}/locations`);
  const found = await eventUseCases().getEvent(actor, { id: eventId });
  if (found.ok) revalidatePath(`/${found.value.event.slug}`, "layout");
}

export async function addLocationUnavailabilityAction(
  input: LocationUnavailabilityInput
): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const result = await sessionUseCases().addLocationUnavailability(actor, {
    eventId: input.eventId,
    locationIds: input.locationIds,
    start: parseDateTime(input.start),
    end: parseDateTime(input.end),
  });
  if (!result.ok)
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  await revalidateEventPaths(actor, input.eventId);
  return { ok: true };
}

export async function deleteLocationUnavailabilityAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const result = await sessionUseCases().deleteLocationUnavailability(
    actor,
    input
  );
  if (!result.ok)
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  await revalidateEventPaths(actor, result.value.eventId);
  return { ok: true };
}
