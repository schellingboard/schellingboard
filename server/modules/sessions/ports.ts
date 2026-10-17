import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface SessionDeps {
  uow: UnitOfWork;
  repos: Pick<
    Repositories,
    | "sessions"
    | "events"
    | "days"
    | "guests"
    | "locations"
    | "locationUnavailability"
    | "rsvps"
  >;
}
