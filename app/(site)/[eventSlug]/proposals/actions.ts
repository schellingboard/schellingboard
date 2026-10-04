"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  sessionProposalSchema,
  sessionProposalUpdateSchema,
} from "@schellingboard/contracts/session";
import { proposalUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { AppError } from "@/server/kernel/result";
import { serverNow } from "@/utils/dev-clock-server";
import {
  actingGuestRefusalMessage,
  unverifiedUserMessage,
  verifiedCurrentUser,
} from "@/utils/acting-guest";
import { requireSiteAuth } from "@/utils/action-auth";

export async function createProposal(
  sessionProposal: z.input<typeof sessionProposalSchema>
): Promise<{ error: string | z.core.$ZodIssue[] } | { success: true }>;
export async function createProposal(
  input: unknown
): Promise<{ error: string | z.core.$ZodIssue[] } | { success: true }> {
  await requireSiteAuth();
  const cookieStore = await cookies();
  if (!(await verifiedCurrentUser(cookieStore))) {
    return {
      error: await unverifiedUserMessage(cookieStore, "creating a proposal"),
    };
  }

  const parseResult = await sessionProposalSchema.safeParseAsync(input);
  if (!parseResult.success) {
    return { error: parseResult.error.issues };
  }
  const { eventSlug, ...fields } = parseResult.data;

  try {
    const result = await proposalUseCases().createProposal(
      await resolveActor(cookieStore),
      fields,
      await serverNow()
    );
    if (!result.ok) {
      return refusal(result.error, "creating a proposal", fields.hostIds);
    }
    revalidatePath(`/${eventSlug}/proposals`);
  } catch (error) {
    console.error("Error creating proposal:", error);
    return { error: "Failed to create proposal" };
  }
  return { success: true };
}

export async function updateProposal(
  id: string,
  sessionProposal: z.input<typeof sessionProposalUpdateSchema>
): Promise<{ error: string | z.core.$ZodIssue[] } | { success: true }>;
export async function updateProposal(
  id: string,
  input: unknown
): Promise<{ error: string | z.core.$ZodIssue[] } | { success: true }> {
  await requireSiteAuth();
  const parseResult = await sessionProposalUpdateSchema.safeParseAsync(input);
  if (!parseResult.success) {
    return { error: parseResult.error.issues };
  }
  const { eventSlug, expectedUpdatedTime, ...fields } = parseResult.data;

  try {
    const result = await proposalUseCases().updateProposal(
      await resolveActor(await cookies()),
      {
        ...fields,
        proposalId: id,
        expectedUpdatedTime: new Date(expectedUpdatedTime),
      },
      await serverNow()
    );
    if (!result.ok) {
      return refusal(result.error, "editing a proposal", fields.hostIds);
    }
    revalidatePath(`/${eventSlug}/proposals`);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return { error: "Failed to update proposal" };
  }
  return { success: true };
}

export async function joinProposal(
  id: string,
  eventSlug: string
): Promise<{ error: string } | { success: true }> {
  await requireSiteAuth();
  try {
    const result = await proposalUseCases().joinProposal(
      await resolveActor(await cookies()),
      { proposalId: id },
      await serverNow()
    );
    if (!result.ok) {
      return {
        error: actingGuestMessage(result.error, "hosting a proposal"),
      };
    }
    revalidatePath(`/${eventSlug}/proposals`);
  } catch (error) {
    console.error("Error joining proposal:", error);
    return { error: "Failed to join the proposal" };
  }
  return { success: true };
}

export async function deleteProposal(
  id: string,
  eventSlug: string
): Promise<{ error: string } | undefined> {
  await requireSiteAuth();
  try {
    const result = await proposalUseCases().deleteProposal(
      await resolveActor(await cookies()),
      { proposalId: id }
    );
    if (!result.ok) {
      return { error: result.error.detail ?? "Failed to delete proposal" };
    }
    revalidatePath(`/${eventSlug}/proposals`);
  } catch (error) {
    console.error("Error deleting proposal:", error);
    return { error: "Failed to delete proposal" };
  }
  // Leaving the navigation to the caller would have Next re-render the page
  // this action ran on first — the deleted proposal's own edit page, whose
  // notFound() then reaches the browser as an uncaught error. Redirecting
  // here replaces that render with the list's. Outside the try: redirect()
  // works by throwing, and the catch above would swallow it.
  redirect(`/${eventSlug}/proposals`);
}

function actingGuestMessage(error: AppError, task: string): string {
  return error.code.startsWith("guest.") && error.code !== "guest.notInEvent"
    ? actingGuestRefusalMessage(error.code, task)
    : (error.detail ?? "Something went wrong");
}

function refusal(
  error: AppError,
  task: string,
  hostIds: string[]
): { error: string | z.core.$ZodIssue[] } {
  if (error.code === "proposal.hostNotInEvent") {
    return {
      error: [
        {
          code: "custom",
          path: ["hostIds"],
          message: "A host is not part of this event",
          input: hostIds,
        },
      ],
    };
  }
  if (error.code === "event.notFound") {
    return { error: "The proposal phase is over" };
  }
  return { error: actingGuestMessage(error, task) };
}
