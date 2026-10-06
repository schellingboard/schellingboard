"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import type {
  createGuestSchema,
  updateGuestSchema,
} from "@schellingboard/contracts/guest";
import { peopleUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { AppError, Result } from "@/server/kernel/result";

export type AdminFormActionResult =
  { ok: true } | { ok: false; error: string | z.core.$ZodIssue[] };
export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function actor() {
  return resolveActor(await cookies());
}

function refused({ detail }: AppError): AdminActionResult {
  return { ok: false, error: detail ?? "Something went wrong" };
}

function settled(result: Result<unknown>): AdminActionResult {
  if (!result.ok) return refused(result.error);
  revalidatePath("/admin/users");
  return { ok: true };
}

// Field issues go back as issues, so each message lands on its input.
function settledForm(result: Result<unknown>): AdminFormActionResult {
  const errors = result.ok ? undefined : result.error.errors;
  if (!errors) return settled(result);
  return {
    ok: false,
    error: errors.map(({ path, message }) => ({
      code: "custom",
      path: path ? path.split(".") : [],
      message,
      input: undefined,
    })),
  };
}

export async function createGuestAction(
  input: z.input<typeof createGuestSchema>
): Promise<AdminFormActionResult>;
export async function createGuestAction(
  input: unknown
): Promise<AdminFormActionResult> {
  return settledForm(await peopleUseCases().createGuest(await actor(), input));
}

export async function updateGuestAction(
  input: z.input<typeof updateGuestSchema>
): Promise<AdminFormActionResult>;
export async function updateGuestAction(
  input: unknown
): Promise<AdminFormActionResult> {
  return settledForm(await peopleUseCases().updateGuest(await actor(), input));
}

export async function deleteGuestAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  return settled(await peopleUseCases().deleteGuest(await actor(), input));
}

export async function sendTestEmailAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  const result = await peopleUseCases().sendTestEmail(await actor(), input);
  return result.ok ? { ok: true } : refused(result.error);
}
