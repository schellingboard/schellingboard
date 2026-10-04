"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sessionUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { AdminActionResult } from "./admin-guests";

export async function adminRemoveRsvpAction(input: {
  sessionId: string;
  guestId: string;
}): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const result = await sessionUseCases().adminRemoveRsvp(actor, input);
  if (!result.ok)
    return { ok: false, error: result.error.detail ?? "Failed to remove RSVP" };

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${result.value.eventId}`);
  return { ok: true };
}
