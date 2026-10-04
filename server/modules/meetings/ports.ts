import type { Repositories } from "@/db/container";
import type { Meeting } from "@schellingboard/domain/meeting";

export type MeetingOutcome = "accepted" | "declined" | "canceled";

export interface MeetingDeps {
  repos: Pick<
    Repositories,
    | "events"
    | "days"
    | "guests"
    | "meetings"
    | "meetingAvailability"
    | "meetingPoints"
    | "sessions"
    | "rsvps"
  >;
  notifyMeetingRequested: (args: {
    meeting: Meeting;
    now: Date;
  }) => Promise<void>;
  notifyMeetingOutcome: (args: {
    meeting: Meeting;
    outcome: MeetingOutcome;
    actorId: string;
    now: Date;
  }) => Promise<void>;
}
