"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notificationUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { serverNow } from "@/utils/dev-clock-server";
import { requireSiteAuth } from "@/utils/action-auth";

export type NotificationActionResult =
  { ok: true } | { ok: false; error: string };

const NO_USER = "No user is logged in";

async function actor() {
  return resolveActor(await cookies());
}

export async function markNotificationsReadAction(
  ids: string[]
): Promise<NotificationActionResult> {
  await requireSiteAuth();
  const result = await notificationUseCases().markNotificationsRead(
    await actor(),
    { ids },
    await serverNow()
  );
  if (!result.ok) return { ok: false, error: NO_USER };

  // Only this page: the badge sits in a layout that reads cookies, so it is
  // never statically cached, and the caller refreshes the router anyway.
  // revalidatePath("/", "layout") would purge every route for every visitor.
  revalidatePath("/notifications");
  return { ok: true };
}

export async function deleteNotificationsAction(
  ids: string[]
): Promise<NotificationActionResult> {
  await requireSiteAuth();
  const result = await notificationUseCases().deleteNotifications(
    await actor(),
    { ids }
  );
  if (!result.ok) return { ok: false, error: NO_USER };
  revalidatePath("/notifications");
  return { ok: true };
}

/**
 * What clicking a notification does: mark it read, then go to what happened.
 * One step rather than a fire-and-forget call racing the navigation away from
 * the page. Silently does nothing when the notification isn't the caller's —
 * there is no page left to report an error on.
 */
export async function openNotificationAction(id: string): Promise<void> {
  await requireSiteAuth();
  const result = await notificationUseCases().readNotification(
    await actor(),
    { id },
    await serverNow()
  );
  if (!result.ok) return;

  revalidatePath("/notifications");
  redirect(result.value.url);
}
