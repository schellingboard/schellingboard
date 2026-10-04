"use server";

import { cookies } from "next/headers";
import { pushSubscriptionSchema } from "@schellingboard/contracts/push";
import { notificationUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import { actingGuestRefusalMessage } from "@/utils/acting-guest";
import { requireVerifiedGuest } from "@/utils/action-auth";
import { serverNow } from "@/utils/dev-clock-server";

export type PushActionResult = { ok: true } | { ok: false; error: string };

const UNUSABLE = "That is not a usable push subscription";

function settled<T>(result: Result<T>, task: string): T {
  if (!result.ok)
    throw new Error(actingGuestRefusalMessage(result.error.code, task));
  return result.value;
}

/**
 * Remembers this browser as one of the guest's notification devices. Called
 * after the browser has agreed: the permission prompt and the subscription
 * both live in the client, and only the result reaches us.
 */
export async function subscribeToPushAction(
  input: unknown
): Promise<PushActionResult> {
  const task = "turning on notifications";
  await requireVerifiedGuest(task);
  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: UNUSABLE };

  settled(
    await notificationUseCases().subscribeToPush(
      await resolveActor(await cookies()),
      parsed.data,
      await serverNow()
    ),
    task
  );
  return { ok: true };
}

export async function unsubscribeFromPushAction(
  endpoint: unknown
): Promise<PushActionResult> {
  const task = "turning off notifications";
  await requireVerifiedGuest(task);
  if (typeof endpoint !== "string") return { ok: false, error: UNUSABLE };

  settled(
    await notificationUseCases().unsubscribeFromPush(
      await resolveActor(await cookies()),
      { endpoint }
    ),
    task
  );
  return { ok: true };
}

export async function pushEnabledHereAction(
  endpoint: unknown
): Promise<boolean> {
  const task = "checking notifications";
  await requireVerifiedGuest(task);
  if (typeof endpoint !== "string") return false;

  return settled(
    await notificationUseCases().isPushEnabledHere(
      await resolveActor(await cookies()),
      { endpoint }
    ),
    task
  );
}
