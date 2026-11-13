import type { Notification } from "@schellingboard/domain/notification";

import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { renderNotice } from "@/server/kernel/notice";
import { notificationsChanged } from "@/server/kernel/notification-changes";
import { notFound, ok, type Result } from "@/server/kernel/result";
import { type Translate, translatorFor } from "@/server/kernel/translator";

import type { NotificationDeps } from "../ports";

const inLanguage = (notification: Notification, t: Translate): Notification =>
  notification.message
    ? { ...notification, text: renderNotice(notification.message, t) }
    : notification;

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
    const [guest, notifications, unreadCount] = await Promise.all([
      repos.guests.findById(guestId),
      repos.notifications.listByGuest(guestId),
      repos.notifications.countUnread(guestId),
    ]);
    const t = translatorFor(guest?.info.locale);
    return ok({
      guestId,
      notifications: notifications.map((n) => inLanguage(n, t)),
      unreadCount,
    });
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
      const guest = await tx.guests.findById(acting.value);
      return ok({
        guestId: acting.value,
        notification: {
          ...inLanguage(notification, translatorFor(guest?.info.locale)),
          readAt: notification.readAt ?? now,
        },
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
