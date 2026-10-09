import type { Repositories } from "@/db/container";
import type { Session } from "@schellingboard/domain/session";
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
  notifyCohostsAdded(args: {
    session: Session;
    previousHostIds: string[];
    changedById: string | null;
    now: Date;
  }): Promise<void>;
}
