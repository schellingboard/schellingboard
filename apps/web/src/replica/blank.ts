import type { Snapshot } from "@schellingboard/contracts/snapshot";

/**
 * A replica of nothing, for a screen that runs commands without belonging to an
 * event: its commands only ever read the viewer, which here is nobody.
 */
export function blankSnapshot(now: string): Snapshot {
  return {
    seq: 0,
    now,
    event: {
      id: "",
      slug: "",
      name: "",
      description: "",
      website: "",
      timezone: "UTC",
      maxSessionDuration: 0,
      breakMinutes: 0,
      slotIncrementMinutes: 0,
      rsvpCapacityHardLimit: false,
      icon: null,
      identityMode: "open",
      meetingsEnabled: false,
      maxOpenMeetingRequests: 0,
      firstDayStart: null,
      lastDayStart: null,
      proposalPhaseStart: null,
      proposalPhaseEnd: null,
      votingPhaseStart: null,
      votingPhaseEnd: null,
      schedulingPhaseStart: null,
      schedulingPhaseEnd: null,
      version: 0,
    },
    days: [],
    locations: [],
    unavailability: [],
    guests: [],
    sessions: [],
    counts: {},
    proposals: [],
    meetingPoints: [],
    me: null,
  };
}
