import type { Repositories } from "@/db/container";

export interface NotificationDeps {
  repos: Pick<Repositories, "guests" | "notifications" | "push">;
}
