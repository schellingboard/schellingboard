"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { peopleUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";

export type ImportGuestsResult =
  | { ok: true; created: number; existing: number }
  | { ok: false; error: string; lineErrors?: string[] };

export async function importGuestsAction(input: {
  csvText: string;
  eventIds: string[];
}): Promise<ImportGuestsResult> {
  const result = await peopleUseCases().importGuests(
    await resolveActor(await cookies()),
    { csv: input.csvText, eventIds: input.eventIds }
  );
  if (!result.ok) {
    const { detail, errors } = result.error;
    return {
      ok: false,
      error: detail ?? "Something went wrong",
      ...(errors ? { lineErrors: errors.map((e) => e.message) } : {}),
    };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  for (const eventId of new Set(input.eventIds)) {
    revalidatePath(`/admin/events/${eventId}`);
  }
  return { ok: true, ...result.value };
}
