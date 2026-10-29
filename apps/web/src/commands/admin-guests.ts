import type { ApiClient } from "@schellingboard/api-client";

type GuestBody = { name: string; email: string };

/** The admin users screens' calls; they wait for each answer, so none is a command. */
export function adminGuestCalls(api: ApiClient) {
  return {
    create: (body: GuestBody, key: string) =>
      api.POST("/api/v1/admin/guests", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    update: (
      id: string,
      body: GuestBody,
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/guests/{id}", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    remove: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/guests/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    sendTestEmail: (id: string, key: string) =>
      api.POST("/api/v1/admin/guests/{id}/test-email", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    importCsv: (csv: string, eventIds: string[], key: string) =>
      api.POST("/api/v1/admin/guests/import", {
        body: { csv, eventIds },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type AdminGuestCalls = ReturnType<typeof adminGuestCalls>;
