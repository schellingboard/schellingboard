import type { ApiClient } from "@schellingboard/api-client";

export const confirmNameCall =
  (api: ApiClient) => (name: string, key: string) =>
    api.POST("/api/v1/me/name", {
      body: { name },
      headers: { "Idempotency-Key": key },
    });
