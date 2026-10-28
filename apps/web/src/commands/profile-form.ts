import type { ApiClient } from "@schellingboard/api-client";
import type { profileBodySchema } from "@schellingboard/contracts/guest";

export type ProfileBody = (typeof profileBodySchema)["_input"];

/**
 * The profile form's calls. The photo has its own endpoints, so a save that
 * changes it is two calls; the form sends the photo first.
 */
export function profileFormCalls(api: ApiClient) {
  return {
    save: (body: ProfileBody, key: string) =>
      api.PUT("/api/v1/me/profile", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    replaceAvatar: (image: Blob, expectedVersion: number, key: string) => {
      const form = new FormData();
      form.set("avatar", image, "avatar");
      form.set("expectedVersion", String(expectedVersion));
      return api.PUT("/api/v1/me/avatar", {
        // The generated type wants the form's fields; bodySerializer sends the real FormData.
        body: { avatar: "", expectedVersion: "" },
        bodySerializer: () => form,
        headers: { "Idempotency-Key": key },
      });
    },
    removeAvatar: (expectedVersion: number, key: string) =>
      api.DELETE("/api/v1/me/avatar", {
        params: { query: { expectedVersion: String(expectedVersion) } },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type ProfileFormCalls = ReturnType<typeof profileFormCalls>;
