import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface NotificationDeps {
  uow: UnitOfWork;
  repos: Pick<Repositories, "guests" | "notifications" | "push">;
}
