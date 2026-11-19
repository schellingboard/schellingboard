import type { Notification } from "@schellingboard/domain/notification";

import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { notificationsChanged } from "@/server/kernel/notification-changes";
import { notFound, ok, type Result } from "@/server/kernel/result";

import type { NotificationDeps } from "../ports";

export interface MyNotifications {
  guestId: string;
  notifications: Notification[];
  unreadCount: number;
}

export const listMyNotifications =
  ({ repos }: NotificationDeps) =>
  async (actor: Actor): Promise<Result<MyNotifications>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const guestId = acting.value;
    const [notifications, unreadCount] = await Promise.all([
      repos.notifications.listByGuest(guestId),
      repos.notifications.countUnread(guestId),
    ]);
    return ok({ guestId, notifications, unreadCount });
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
    notificationsChanged(acting.value);
    return ok(undefined);
  };

export const deleteNotifications =
  ({ repos }: NotificationDeps) =>
  async (actor: Actor, { ids }: { ids: string[] }): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    await repos.notifications.deleteMany(acting.value, ids);
    notificationsChanged(acting.value);
    return ok(undefined);
  };

export const readNotification =
  ({ uow }: NotificationDeps) =>
  async (
    actor: Actor,
    { id }: { id: string },
    now: Date
  ): Promise<Result<Notification>> => {
    const result = await uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const notification = await tx.notifications.findForGuest(
        acting.value,
        id
      );
      if (!notification)
        return notFound("notification.notFound", "Notification not found");
      await tx.notifications.markRead(acting.value, id, now);
      return ok({
        guestId: acting.value,
        notification: { ...notification, readAt: notification.readAt ?? now },
      });
    });
    if (!result.ok) return result;
    notificationsChanged(result.value.guestId);
    return ok(result.value.notification);
  };

export interface NotificationStreamTarget {
  guestId: string;
  unreadCount: () => Promise<number>;
}

export const openNotificationStream =
  ({ repos }: NotificationDeps) =>
  async (actor: Actor): Promise<Result<NotificationStreamTarget>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const guestId = acting.value;
    return ok({
      guestId,
      unreadCount: () => repos.notifications.countUnread(guestId),
    });
  };
