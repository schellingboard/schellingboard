import type { Repositories } from "@/db/container";

export const unreadNotificationCount = (
  q: Pick<Repositories, "notifications">,
  guestId: string
) => q.notifications.countUnread(guestId);
