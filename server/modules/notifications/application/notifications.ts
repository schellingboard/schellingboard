import type { Notification } from "@schellingboard/domain/notification";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { NotificationDeps } from "../ports";

export interface MyNotifications {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export const listMyNotifications =
  ({ repos }: NotificationDeps) =>
  async (
    actor: Actor,
    { limit }: { limit: number }
  ): Promise<Result<MyNotifications>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const guestId = acting.value;
    const [notifications, unreadCount, total] = await Promise.all([
      repos.notifications.listByGuest(guestId, { limit }),
      repos.notifications.countUnread(guestId),
      repos.notifications.countByGuest(guestId),
    ]);
    return ok({ notifications, unreadCount, total });
  };

export const markNotificationsRead =
  ({ repos }: NotificationDeps) =>
  async (
    actor: Actor,
    { ids }: { ids: string[] },
    now: Date
  ): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    await repos.notifications.markManyRead(acting.value, ids, now);
    return ok(undefined);
  };

export const deleteNotifications =
  ({ repos }: NotificationDeps) =>
  async (actor: Actor, { ids }: { ids: string[] }): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    await repos.notifications.deleteMany(acting.value, ids);
    return ok(undefined);
  };

export const readNotification =
  ({ repos }: NotificationDeps) =>
  async (
    actor: Actor,
    { id }: { id: string },
    now: Date
  ): Promise<Result<Notification>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const notification = await repos.notifications.findForGuest(
      acting.value,
      id
    );
    if (!notification)
      return notFound("notification.notFound", "Notification not found");
    await repos.notifications.markRead(acting.value, id, now);
    return ok({ ...notification, readAt: notification.readAt ?? now });
  };
