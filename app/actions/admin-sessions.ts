"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getRepositories } from "@/db/container";
import { sessionUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import type { Session } from "@schellingboard/domain/session";
import { serverNow } from "@/utils/dev-clock-server";
import type { AdminActionResult } from "./admin-guests";

export type AdminSessionInput = {
  id: string;
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
};

// The attendee-facing schedule fetches the session list in the shared
// [eventSlug] layout (see app/(site)/[eventSlug]/session-actions.ts), so the
// public layout must be revalidated alongside the admin pages.
async function revalidateEventPaths(eventId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  const event = await getRepositories().events.findById(eventId);
  if (event) revalidatePath(`/${event.slug}`, "layout");
}

async function settle(
  run: () => Promise<Result<Session>>,
  failure: string
): Promise<AdminActionResult> {
  let result;
  try {
    result = await run();
  } catch {
    return { ok: false, error: failure };
  }
  if (!result.ok) return { ok: false, error: result.error.detail ?? failure };
  await revalidateEventPaths(result.value.eventId);
  return { ok: true };
}

export type AdminSessionCreateInput = Omit<AdminSessionInput, "id"> & {
  eventId: string;
};

export async function adminCreateSessionAction(
  input: AdminSessionCreateInput
): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const now = await serverNow();
  return settle(
    () => sessionUseCases().adminCreateSession(actor, input, now),
    "Failed to create session"
  );
}

export async function adminUpdateSessionAction(
  input: AdminSessionInput
): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const now = await serverNow();
  return settle(
    () => sessionUseCases().adminUpdateSession(actor, input, now),
    "Failed to update session"
  );
}

export async function adminDeleteSessionAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const now = await serverNow();
  return settle(
    () => sessionUseCases().adminDeleteSession(actor, input, now),
    "Failed to delete session"
  );
}
