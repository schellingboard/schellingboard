import type { ApiClient } from "@schellingboard/api-client";
import type {
  sessionCreateSchema,
  sessionUpdateSchema,
} from "@schellingboard/contracts/session";

export type SessionCreateBody = (typeof sessionCreateSchema)["_input"];
export type SessionUpdateBody = (typeof sessionUpdateSchema)["_input"];

export type HostClashQuery = {
  eventId: string;
  guestIds: string[];
  start: string;
  end: string;
  excludeSessionId?: string;
};

/** The session form's calls; it waits for each answer, so none is a command. */
export function sessionFormCalls(api: ApiClient) {
  return {
    create: (body: SessionCreateBody, key: string) =>
      api.POST("/api/v1/sessions", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    update: (id: string, body: SessionUpdateBody, key: string) =>
      api.PUT("/api/v1/sessions/{id}", {
        params: { path: { id } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    remove: (id: string, key: string) =>
      api.DELETE("/api/v1/sessions/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    hostClashes: async ({ guestIds, ...query }: HostClashQuery) => {
      const { data } = await api.GET("/api/v1/host-clashes", {
        params: { query: { ...query, guestIds: guestIds.join(",") } },
      });
      return data?.clashes;
    },
  };
}

export type SessionFormCalls = ReturnType<typeof sessionFormCalls>;
