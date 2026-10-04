import type { NotificationDeps } from "../ports";
import { getMyEmailSettings, updateMyEmailSettings } from "./email-settings";
import {
  deleteNotifications,
  listMyNotifications,
  markNotificationsRead,
  readNotification,
} from "./notifications";
import {
  isPushEnabledHere,
  subscribeToPush,
  unsubscribeFromPush,
} from "./push";

export function createNotificationUseCases(deps: NotificationDeps) {
  return {
    listMyNotifications: listMyNotifications(deps),
    markNotificationsRead: markNotificationsRead(deps),
    deleteNotifications: deleteNotifications(deps),
    readNotification: readNotification(deps),
    getMyEmailSettings: getMyEmailSettings(deps),
    updateMyEmailSettings: updateMyEmailSettings(deps),
    subscribeToPush: subscribeToPush(deps),
    unsubscribeFromPush: unsubscribeFromPush(deps),
    isPushEnabledHere: isPushEnabledHere(deps),
  };
}

export type NotificationUseCases = ReturnType<
  typeof createNotificationUseCases
>;
