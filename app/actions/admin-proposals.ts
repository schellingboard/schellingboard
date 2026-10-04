"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { proposalUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { serverNow } from "@/utils/dev-clock-server";
import type { AdminActionResult } from "./admin-guests";

export type AdminProposalInput = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  hostIds: string[];
  expectedUpdatedTime: string;
};

function revalidateEventPaths(eventId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function adminUpdateProposalAction(
  input: AdminProposalInput
): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const result = await proposalUseCases().adminUpdateProposal(
    actor,
    input,
    await serverNow()
  );
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.detail ?? "Failed to update proposal",
    };
  }
  revalidateEventPaths(result.value.eventId);
  return { ok: true };
}

export async function adminDeleteProposalAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  let result;
  try {
    result = await proposalUseCases().adminDeleteProposal(actor, input);
  } catch {
    return { ok: false, error: "Failed to delete proposal" };
  }
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.detail ?? "Failed to delete proposal",
    };
  }
  revalidateEventPaths(result.value.eventId);
  return { ok: true };
}
