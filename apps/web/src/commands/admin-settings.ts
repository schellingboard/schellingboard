import type { ApiClient } from "@schellingboard/api-client";

export function adminSettingsCalls(api: ApiClient) {
  return {
    save: (
      body: {
        title: string;
        description: string;
        image?: Blob;
        removeMap: boolean;
      },
      key: string
    ) => {
      const form = new FormData();
      form.set("title", body.title);
      form.set("description", body.description);
      if (body.image) form.set("image", body.image, "map");
      if (body.removeMap) form.set("removeMap", "true");
      return api.PUT("/api/v1/admin/settings", {
        // The generated type wants the form's fields; bodySerializer sends the real FormData.
        body: { title: "" },
        bodySerializer: () => form,
        headers: { "Idempotency-Key": key },
      });
    },
  };
}

export type AdminSettingsCalls = ReturnType<typeof adminSettingsCalls>;
