import type { ApiClient } from "@schellingboard/api-client";

import { NOTIFICATION_IDS_MAX } from "@schellingboard/contracts/notification";

const NOTIFICATION_BATCH = NOTIFICATION_IDS_MAX;

/** The notification list waits for every answer, so none of these is a command. */
export function notificationCalls(api: ApiClient) {
  const removeBatch = (ids: string[], key: string) =>
    api.DELETE("/api/v1/me/notifications", {
      params: { query: { ids: ids.join(",") } },
      headers: { "Idempotency-Key": key },
    });
  const keyed = (key: string) => ({ "Idempotency-Key": key });
  return {
    list: (limit: number, cursor?: string) =>
      api.GET("/api/v1/me/notifications", {
        params: { query: { limit, cursor } },
      }),
    markRead: (ids: string[], key: string) =>
      api.POST("/api/v1/me/notifications/read", {
        body: { ids },
        headers: keyed(key),
      }),
    remove: async (ids: string[], key: string) => {
      let last: Awaited<ReturnType<typeof removeBatch>> | undefined;
      for (let i = 0; i < ids.length || i === 0; i += NOTIFICATION_BATCH) {
        last = await removeBatch(
          ids.slice(i, i + NOTIFICATION_BATCH),
          `${key}-${i}`
        );
        if (last.error) break;
      }
      return last!;
    },
    open: (id: string, key: string) =>
      api.POST("/api/v1/me/notifications/{id}/read", {
        params: { path: { id } },
        headers: keyed(key),
      }),
  };
}

export type NotificationCalls = ReturnType<typeof notificationCalls>;
