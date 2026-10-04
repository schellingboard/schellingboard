"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { settingsUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { AdminActionResult } from "./admin-guests";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateSettingsAction(
  formData: FormData
): Promise<AdminActionResult> {
  const actor = await resolveActor(await cookies());
  const imageEntry = formData.get("image");
  const image =
    actor.admin && imageEntry instanceof File && imageEntry.size > 0
      ? Buffer.from(await imageEntry.arrayBuffer())
      : undefined;

  const result = await settingsUseCases().updateSiteSettings(actor, {
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    image,
    removeMap: formData.get("removeMap") === "on",
  });
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
