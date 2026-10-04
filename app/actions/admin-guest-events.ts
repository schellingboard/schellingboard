"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { peopleUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import type { AdminActionResult } from "./admin-guests";

function settled(result: Result<void>, eventId: string): AdminActionResult {
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

export async function assignGuestsToEventAction(input: {
  eventId: string;
  guestIds: string[];
}): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  return settled(
    await peopleUseCases().assignGuestsToEvent(actor, input),
    input.eventId
  );
}

export async function removeGuestsFromEventAction(input: {
  eventId: string;
  guestIds: string[];
}): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  return settled(
    await peopleUseCases().removeGuestsFromEvent(actor, input),
    input.eventId
  );
}
