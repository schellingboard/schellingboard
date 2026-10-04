import type { Repositories } from "@/db/container";

export interface EventDeps {
  repos: Pick<
    Repositories,
    "events" | "days" | "sessions" | "meetingAvailability"
  >;
}
