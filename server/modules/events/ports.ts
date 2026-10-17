import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface EventDeps {
  uow: UnitOfWork;
  repos: Pick<
    Repositories,
    "events" | "days" | "sessions" | "meetingAvailability"
  >;
}
