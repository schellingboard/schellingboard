"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { meetingUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Failure } from "@/server/kernel/result";
import { actingGuestRefusalMessage } from "@/utils/acting-guest";
import { requireSiteAuth } from "@/utils/action-auth";
import { serverNow } from "@/utils/dev-clock-server";
import {
  meetingAvailabilitySchema,
  meetingCancelSchema,
  meetingRequestSchema,
  meetingRespondSchema,
} from "@schellingboard/contracts/meeting";

// A "use server" export is a public endpoint behind site auth, so each
// action's parameter type is advisory: the payload is parsed against its
// contract, and a malformed one comes back as a result instead of throwing.

export type MeetingActionResult = { ok: true } | { ok: false; error: string };

const INVALID: MeetingActionResult = { ok: false, error: "Invalid request" };

async function actor() {
  return resolveActor(await cookies());
}

function refused(
  result: Failure,
  guestRefusal: (code: string) => string
): MeetingActionResult {
  const { code, detail } = result.error;
  return {
    ok: false,
    error:
      code === "guest.unselected" || code === "guest.protected"
        ? guestRefusal(code)
        : (detail ?? "Something went wrong"),
  };
}

export async function requestMeetingAction(
  raw: z.input<typeof meetingRequestSchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();
  const parsed = meetingRequestSchema.safeParse(raw);
  if (!parsed.success) return INVALID;

  const result = await meetingUseCases().requestMeeting(
    await actor(),
    parsed.data,
    await serverNow()
  );
  if (!result.ok) return refused(result, () => "Sign in to request a 1-on-1");
  return { ok: true };
}

export async function respondToMeetingAction(
  raw: z.input<typeof meetingRespondSchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();
  const parsed = meetingRespondSchema.safeParse(raw);
  if (!parsed.success) return INVALID;

  const result = await meetingUseCases().respondToMeeting(
    await actor(),
    parsed.data,
    await serverNow()
  );
  if (!result.ok)
    return refused(result, () => "Sign in to answer a 1-on-1 request");
  revalidatePath(`/${result.value.eventSlug}`);
  return { ok: true };
}

export async function cancelMeetingAction(
  raw: z.input<typeof meetingCancelSchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();
  const parsed = meetingCancelSchema.safeParse(raw);
  if (!parsed.success) return INVALID;

  const result = await meetingUseCases().cancelMeeting(
    await actor(),
    parsed.data,
    await serverNow()
  );
  if (!result.ok) return refused(result, () => "Sign in to cancel a 1-on-1");
  revalidatePath(`/${result.value.eventSlug}`);
  return { ok: true };
}

export async function saveMeetingAvailabilityAction(
  raw: z.input<typeof meetingAvailabilitySchema>
): Promise<MeetingActionResult> {
  await requireSiteAuth();
  const parsed = meetingAvailabilitySchema.safeParse(raw);
  if (!parsed.success) return INVALID;

  const result = await meetingUseCases().saveMeetingAvailability(
    await actor(),
    parsed.data,
    await serverNow()
  );
  if (!result.ok)
    return refused(result, (code) =>
      actingGuestRefusalMessage(code, "setting your 1-on-1 availability")
    );
  revalidatePath("/settings");
  return { ok: true };
}
