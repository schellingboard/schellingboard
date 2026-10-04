"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { meetingUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import type { AdminActionResult } from "./admin-guests";

export type EventMeetingsInput = {
  id: string;
  meetingsEnabled: boolean;
  maxOpenMeetingRequests: string;
};

export type MeetingPointInput = {
  eventId: string;
  name: string;
  description?: string;
};

async function actor() {
  return resolveActor(await cookies());
}

function settled(result: Result<unknown>, eventId: string): AdminActionResult {
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

export async function updateEventMeetingsAction(
  input: EventMeetingsInput
): Promise<AdminActionResult> {
  const result = await meetingUseCases().updateEventMeetings(await actor(), {
    eventId: input.id,
    meetingsEnabled: input.meetingsEnabled,
    maxOpenMeetingRequests: input.meetingsEnabled
      ? parseInt(input.maxOpenMeetingRequests, 10)
      : undefined,
  });
  return settled(result, input.id);
}

export async function createMeetingPointAction(
  input: MeetingPointInput
): Promise<AdminActionResult> {
  const result = await meetingUseCases().createMeetingPoint(
    await actor(),
    input
  );
  return settled(result, input.eventId);
}

export async function updateMeetingPointAction(
  input: MeetingPointInput & { id: string }
): Promise<AdminActionResult> {
  const result = await meetingUseCases().updateMeetingPoint(
    await actor(),
    input
  );
  return settled(result, input.eventId);
}

export async function deleteMeetingPointAction(input: {
  id: string;
  eventId: string;
}): Promise<AdminActionResult> {
  const result = await meetingUseCases().deleteMeetingPoint(
    await actor(),
    input
  );
  return settled(result, input.eventId);
}
