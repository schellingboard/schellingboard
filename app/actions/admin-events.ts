"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eventUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import type { AdminActionResult } from "./admin-guests";

export type EventInput = {
  name: string;
  description: string;
  website: string;
  timezone: string;
  maxSessionDuration: string;
  breakMinutes: string;
  slotIncrementMinutes: string;
  rsvpCapacityHardLimit?: boolean;
  icon?: string;
};

export type EventPhasesInput = {
  id: string;
  proposalPhaseStart?: string;
  proposalPhaseEnd?: string;
  votingPhaseStart?: string;
  votingPhaseEnd?: string;
  schedulingPhaseStart?: string;
  schedulingPhaseEnd?: string;
};

async function actor() {
  return resolveActor(await cookies());
}

function settled(result: Result<unknown>, eventId?: string): AdminActionResult {
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

const settings = (input: EventInput) => ({
  ...input,
  maxSessionDuration: parseInt(input.maxSessionDuration, 10),
  breakMinutes: parseInt(input.breakMinutes, 10),
  slotIncrementMinutes: parseInt(input.slotIncrementMinutes, 10),
});

// datetime-local gives "YYYY-MM-DDTHH:mm" without a zone; the forms send UTC.
function phaseDate(value: string | undefined): Date | undefined {
  const raw = value?.trim();
  return raw ? new Date(raw + "Z") : undefined;
}

export async function createEventAction(
  input: EventInput
): Promise<AdminActionResult> {
  return settled(
    await eventUseCases().createEvent(await actor(), settings(input))
  );
}

export async function updateEventAction(
  input: EventInput & { id: string }
): Promise<AdminActionResult> {
  const result = await eventUseCases().updateEvent(await actor(), {
    ...settings(input),
    id: input.id,
  });
  return settled(result, input.id);
}

export async function updateEventPhasesAction(
  input: EventPhasesInput
): Promise<AdminActionResult> {
  const result = await eventUseCases().updateEventPhases(await actor(), {
    id: input.id,
    proposalPhaseStart: phaseDate(input.proposalPhaseStart),
    proposalPhaseEnd: phaseDate(input.proposalPhaseEnd),
    votingPhaseStart: phaseDate(input.votingPhaseStart),
    votingPhaseEnd: phaseDate(input.votingPhaseEnd),
    schedulingPhaseStart: phaseDate(input.schedulingPhaseStart),
    schedulingPhaseEnd: phaseDate(input.schedulingPhaseEnd),
  });
  return settled(result, input.id);
}

export async function deleteEventAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  return settled(await eventUseCases().deleteEvent(await actor(), input));
}
