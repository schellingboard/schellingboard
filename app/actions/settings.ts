"use server";

import { cookies } from "next/headers";
import { notificationUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { emailSettingsSchema } from "@schellingboard/contracts/guest";
import { requireSiteAuth } from "@/utils/action-auth";
import { z } from "zod";

export type SettingsActionResult =
  { ok: true } | { ok: false; error: string | z.core.$ZodIssue[] };

export async function updateEmailSettingsAction(
  settings: z.input<typeof emailSettingsSchema>
): Promise<SettingsActionResult>;

export async function updateEmailSettingsAction(
  settings: unknown
): Promise<SettingsActionResult> {
  await requireSiteAuth();
  const parseResult = emailSettingsSchema.safeParse(settings);
  if (!parseResult.success) {
    return { ok: false, error: parseResult.error.issues };
  }

  const result = await notificationUseCases().updateMyEmailSettings(
    await resolveActor(await cookies()),
    parseResult.data
  );
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.code.startsWith("guest.")
        ? "No user is logged in"
        : (result.error.detail ?? "Something went wrong"),
    };
  }

  return { ok: true };
}
