import type { Repositories } from "@/db/container";

export const siteSettings = (q: Pick<Repositories, "settings">) =>
  q.settings.get();
