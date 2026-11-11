import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface MeetingDeps {
  uow: UnitOfWork;
  repos: Pick<
    Repositories,
    | "events"
    | "days"
    | "guests"
    | "meetings"
    | "meetingAvailability"
    | "meetingNudges"
    | "meetingPoints"
    | "sessions"
    | "rsvps"
  >;
}
