"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { venueUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import type { AdminActionResult } from "./admin-guests";

type EventLocationsInput = { eventId: string; locationIds: string[] };

async function actor() {
  return resolveActor(await cookies());
}

function settled(result: Result<void>, eventId: string): AdminActionResult {
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/locations");
  return { ok: true };
}

export async function assignLocationsToEventAction(
  input: EventLocationsInput
): Promise<AdminActionResult> {
  return settled(
    await venueUseCases().assignLocationsToEvent(await actor(), input),
    input.eventId
  );
}

export async function removeLocationsFromEventAction(
  input: EventLocationsInput
): Promise<AdminActionResult> {
  return settled(
    await venueUseCases().removeLocationsFromEvent(await actor(), input),
    input.eventId
  );
}
