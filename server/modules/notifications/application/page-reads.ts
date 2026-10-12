import type { Repositories } from "@/db/container";

export const notificationCount = (
  q: Pick<Repositories, "notifications">,
  guestId: string
) => q.notifications.countByGuest(guestId);

export const notificationPage = (
  q: Pick<Repositories, "notifications">,
  guestId: string,
  page: { limit: number; offset: number }
) => q.notifications.listByGuest(guestId, page);

export const unreadNotificationCount = (
  q: Pick<Repositories, "notifications">,
  guestId: string
) => q.notifications.countUnread(guestId);
