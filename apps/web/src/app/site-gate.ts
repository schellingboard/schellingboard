import type { ApiClient } from "@schellingboard/api-client";
import { hardNavigate } from "./hard-navigate";

/** The server serves page shells to everyone in dev, so the API call is where a missing site cookie shows. */
export function sendToSiteLoginWhenGated(
  api: ApiClient,
  where: Pick<Location, "pathname" | "search"> = window.location,
  navigate: (href: string) => void = hardNavigate
) {
  api.use({
    onResponse: async ({ response }) => {
      if (response.status !== 401 || where.pathname === "/login") return;
      const problem = (await response
        .clone()
        .json()
        .catch(() => null)) as { code?: string } | null;
      if (problem?.code !== "site.unauthenticated") return;
      navigate(
        `/login?redirect=${encodeURIComponent(where.pathname + where.search)}`
      );
    },
  });
}
