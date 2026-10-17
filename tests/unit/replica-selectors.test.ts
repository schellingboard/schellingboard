// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { eventContextFrom } from "@/app/(site)/[eventSlug]/replica/selectors";

const iso = (hour: number) =>
  new Date(Date.UTC(2026, 5, 15, hour)).toISOString();

const guest = (id: string, member: boolean) => ({
  id,
  name: id.toUpperCase(),
  avatarUrl: null,
  aboutMe: null,
  authProtected: false,
  profileVersion: 1,
  member,
});

const snapshot: Snapshot = {
  seq: 7,
  event: {
    id: "e",
    slug: "conf",
    name: "Conf",
    description: "",
    website: "",
    timezone: "UTC",
    maxSessionDuration: 120,
    breakMinutes: 10,
    slotIncrementMinutes: 30,
    rsvpCapacityHardLimit: false,
    icon: null,
    meetingsEnabled: false,
    maxOpenMeetingRequests: 5,
    firstDayStart: iso(8),
    lastDayStart: iso(8),
    proposalPhaseStart: null,
    proposalPhaseEnd: null,
    votingPhaseStart: null,
    votingPhaseEnd: null,
    schedulingPhaseStart: iso(0),
    schedulingPhaseEnd: null,
    version: 3,
  },
  days: [
    {
      id: "d",
      eventId: "e",
      start: iso(8),
      end: iso(18),
      startBookings: iso(9),
      endBookings: iso(17),
      version: 1,
    },
  ],
  locations: [
    {
      id: "r",
      name: "Room",
      description: "",
      areaDescription: null,
      capacity: 10,
      color: "blue",
      bookable: true,
      imageUrl: "",
      sortIndex: 0,
      version: 1,
    },
  ],
  unavailability: [
    { id: "u", eventId: "e", locationId: "r", start: iso(12), end: iso(13) },
  ],
  guests: [guest("host", false), guest("mia", true)],
  sessions: [
    {
      id: "s",
      eventId: "e",
      title: "Talk",
      description: "",
      startTime: iso(9),
      endTime: iso(10),
      capacity: 10,
      adminManaged: false,
      blocker: false,
      closed: false,
      proposalId: null,
      version: 2,
      hostIds: ["host"],
      locationIds: ["r"],
    },
    {
      id: "unscheduled",
      eventId: "e",
      title: "Later",
      description: "",
      startTime: null,
      endTime: null,
      capacity: 10,
      adminManaged: false,
      blocker: false,
      closed: false,
      proposalId: null,
      version: 1,
      hostIds: [],
      locationIds: [],
    },
  ],
  counts: { s: 4 },
  meetingPoints: [],
  me: {
    guestId: "mia",
    rsvps: [{ id: "x", sessionId: "s", guestId: "mia" }],
    meetings: [],
    meetingGuests: [],
    availability: [],
  },
};

describe("eventContextFrom", () => {
  it("rebuilds the schedule's denormalized shapes from a snapshot", () => {
    const context = eventContextFrom(snapshot);

    const [talk] = context.sessions;
    expect(talk).toMatchObject({
      id: "s",
      hosts: [{ id: "host", name: "HOST" }],
      locations: [{ id: "r", name: "Room", color: "blue" }],
      numRsvps: 4,
      startTime: new Date(iso(9)),
      proposalId: undefined,
    });
    expect(context.sessions[1].numRsvps).toBe(0);
    expect(context.days).toMatchObject([
      { id: "d", start: new Date(iso(8)), sessions: [{ id: "s" }] },
    ]);
    expect(context.event).toMatchObject({
      version: 3,
      firstDayStart: new Date(iso(8)),
      proposalPhaseStart: undefined,
    });
    expect(context.unavailability[0].start).toEqual(new Date(iso(12)));
    expect(context.guests.map((g) => g.id)).toEqual(["mia"]);
    expect(context.rsvps).toEqual([
      { id: "x", sessionId: "s", guestId: "mia" },
    ]);
  });
});
