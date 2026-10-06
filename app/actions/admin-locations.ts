"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import type {
  locationSchema,
  updateLocationSchema,
} from "@schellingboard/contracts/location";
import { venueUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import type { AdminActionResult, AdminFormActionResult } from "./admin-guests";

async function actor() {
  return resolveActor(await cookies());
}

function settled(result: Result<unknown>): AdminActionResult {
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }
  revalidatePath("/admin/locations");
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

export async function createLocationAction(
  formData: z.input<typeof locationSchema>
): Promise<AdminFormActionResult>;
export async function createLocationAction(
  formData: unknown
): Promise<AdminFormActionResult> {
  return settledForm(
    await venueUseCases().createLocation(await actor(), formData)
  );
}

export async function updateLocationAction(
  formData: z.input<typeof updateLocationSchema>
): Promise<AdminFormActionResult>;
export async function updateLocationAction(
  formData: unknown
): Promise<AdminFormActionResult> {
  return settledForm(
    await venueUseCases().updateLocation(await actor(), formData)
  );
}

export async function deleteLocationAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  return settled(await venueUseCases().deleteLocation(await actor(), input));
}

export async function moveLocationAction(input: {
  id: string;
  direction: "up" | "down";
}): Promise<AdminActionResult> {
  return settled(await venueUseCases().moveLocation(await actor(), input));
}
