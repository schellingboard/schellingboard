"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { peopleUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { getImageRepositories } from "@/utils/images";
import { requireSiteAuth } from "@/utils/action-auth";
import { serverNow } from "@/utils/dev-clock-server";
import { profileSchema } from "@schellingboard/contracts/guest";
import { z } from "zod";

export type ProfileActionResult =
  { ok: true } | { ok: false; error: string | z.core.$ZodIssue[] };

const profileActionSchema = profileSchema.extend({
  avatar: profileSchema.shape.avatar.transform(async (avatarFile, ctx) => {
    if (!avatarFile) return avatarFile;
    const { avatars } = getImageRepositories();

    const avatarBuffer = await avatars.validate(
      Buffer.from(await avatarFile.arrayBuffer())
    );

    if ("error" in avatarBuffer) {
      ctx.addIssue({
        code: "custom",
        message: avatarBuffer.error,
      });
      return z.NEVER;
    }

    return avatarBuffer;
  }),
});

export async function updateProfileAction(
  formData: z.input<typeof profileSchema>
): Promise<ProfileActionResult>;

export async function updateProfileAction(
  formData: unknown
): Promise<ProfileActionResult> {
  await requireSiteAuth();
  const parseResult = await profileActionSchema.safeParseAsync(formData);
  if (!parseResult.success) {
    return { ok: false, error: parseResult.error.issues };
  }

  const result = await peopleUseCases().updateMyProfile(
    await resolveActor(await cookies()),
    parseResult.data,
    await serverNow()
  );
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.code.startsWith("guest.")
        ? "No user is logged in"
        : (result.error.detail ?? "Something went wrong"),
    };
  }

  revalidatePath(`/guests/${result.value.id}`);
  revalidatePath("/guests");
  return { ok: true };
}
