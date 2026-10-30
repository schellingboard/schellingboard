import type { ApiClient } from "@schellingboard/api-client";
import type { locationBodySchema } from "@schellingboard/contracts/location";

export type LocationBody = (typeof locationBodySchema)["_input"];

/** The admin locations screen's calls; the image has its own endpoint, so a save that changes it is two calls. */
export function adminLocationCalls(api: ApiClient) {
  return {
    create: (body: LocationBody, key: string) =>
      api.POST("/api/v1/admin/locations", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    update: (
      id: string,
      body: LocationBody,
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/locations/{id}", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    remove: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/locations/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    move: (
      id: string,
      direction: "up" | "down",
      expectedVersion: number,
      key: string
    ) =>
      api.POST("/api/v1/admin/locations/{id}/move", {
        params: { path: { id } },
        body: { direction, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    replaceImage: (
      id: string,
      image: Blob,
      expectedVersion: number,
      key: string
    ) => {
      const form = new FormData();
      form.set("image", image, "image");
      form.set("expectedVersion", String(expectedVersion));
      return api.PUT("/api/v1/admin/locations/{id}/image", {
        params: { path: { id } },
        // The generated type wants the form's fields; bodySerializer sends the real FormData.
        body: { image: "", expectedVersion: "" },
        bodySerializer: () => form,
        headers: { "Idempotency-Key": key },
      });
    },
  };
}

export type AdminLocationCalls = ReturnType<typeof adminLocationCalls>;
