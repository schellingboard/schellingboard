import type { ApiClient } from "@schellingboard/api-client";

/** The notification list waits for every answer, so none of these is a command. */
export function notificationCalls(api: ApiClient) {
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
    remove: (ids: string[], key: string) =>
      api.POST("/api/v1/me/notifications/delete", {
        body: { ids },
        headers: keyed(key),
      }),
    open: (id: string, key: string) =>
      api.POST("/api/v1/me/notifications/{id}/read", {
        params: { path: { id } },
        headers: keyed(key),
      }),
  };
}

export type NotificationCalls = ReturnType<typeof notificationCalls>;
