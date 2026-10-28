// @module-tag 012-US5
import { describe, it, expect } from "vitest";
import { snapshot } from "../../replica/snapshot-fixture";
import { meetingViewsFrom, withClashes } from "./meetings";

const meeting = (patch: object) => ({
  id: "m1",
  eventId: "e",
  requesterId: "mia",
  recipientId: "kai",
  slotStart: "2026-06-15T09:00:00.000Z",
  slotEnd: "2026-06-15T09:30:00.000Z",
  meetingPoint: "Coffee bar",
  message: "hi",
  cancelNote: "",
  status: "accepted" as const,
  createdAt: "2026-06-01T00:00:00.000Z",
  respondedAt: null,
  ...patch,
});

const withMeetings = (meetings: ReturnType<typeof meeting>[]) => ({
  ...snapshot,
  event: { ...snapshot.event, timezone: "Europe/Berlin" },
  me: {
    ...snapshot.me!,
    meetings,
    meetingGuests: [
      {
        id: "kai",
        name: "Kai",
        avatarUrl: null,
        aboutMe: null,
        authProtected: false,
        profileVersion: 1,
      },
    ],
  },
});

describe("meetingViewsFrom", () => {
  it("names the other party, the side and the times in the event's zone", () => {
    const [view] = meetingViewsFrom(
      withMeetings([meeting({})]),
      new Date("2026-06-10T00:00:00Z")
    );
    expect(view).toMatchObject({
      id: "m1",
      role: "requester",
      otherId: "kai",
      otherName: "Kai",
      dayLabel: "Mon 15 Jun",
      timeLabel: "11:10 – 11:30",
      clashes: [],
    });
  });

  it("reads the recipient's side", () => {
    const [view] = meetingViewsFrom(
      withMeetings([meeting({ requesterId: "kai", recipientId: "mia" })]),
      new Date("2026-06-10T00:00:00Z")
    );
    expect(view).toMatchObject({ role: "recipient", otherName: "Kai" });
  });

  it("expires a request nobody answered before its slot began", () => {
    const views = meetingViewsFrom(
      withMeetings([meeting({ status: "pending" })]),
      new Date("2026-06-15T09:00:00Z")
    );
    expect(views[0].status).toBe("expired");
  });

  it("is empty without a viewer, and orders by slot", () => {
    expect(meetingViewsFrom({ ...snapshot, me: null }, new Date())).toEqual([]);
    const later = meeting({ id: "b", slotStart: "2026-06-15T10:00:00.000Z" });
    const views = meetingViewsFrom(
      withMeetings([later, meeting({ id: "a" })]),
      new Date("2026-06-10T00:00:00Z")
    );
    expect(views.map((v) => v.id)).toEqual(["a", "b"]);
  });
});

describe("withClashes", () => {
  it("sets each view's clashes from the map and leaves unknown ones empty", () => {
    const views = meetingViewsFrom(
      withMeetings([meeting({}), meeting({ id: "m2" })]),
      new Date("2026-06-10T00:00:00Z")
    );
    const clash = {
      guestName: "Kai",
      kind: "busy" as const,
      title: null,
      isViewer: false,
    };
    const merged = withClashes(views, new Map([["m1", [clash]]]));
    expect(merged.map((v) => v.clashes)).toEqual([[clash], []]);
  });
});
