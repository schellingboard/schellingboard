import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createDay, createEvent, createGuest } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createEventUseCases } from "@/server/modules/events/module";
import { createMeetingUseCases } from "@/server/modules/meetings/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

const NOBODY: Actor = { admin: false, guest: null };
const ADMIN: Actor = { admin: true, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});
const now = () => new Date();

const DAY = isoDay(30);
const SLOT = `${DAY}T10:00:00.000Z`;
const SLOT_2 = `${DAY}T10:30:00.000Z`;

const notifyMeetingRequested = vi.fn(async () => {});
const notifyMeetingOutcome = vi.fn(async () => {});
const meetings = () =>
  createMeetingUseCases({
    repos: getRepositories(),
    notifyMeetingRequested,
    notifyMeetingOutcome,
    uow: unitOfWork,
  });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}

const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

/** Meetings on, one day, two attendees; Grace is free at both slots. */
async function scenario() {
  const repos = getRepositories();
  const event = await createEvent({ phase: "scheduling" });
  await repos.events.update(event.id, {
    meetingsEnabled: true,
    maxOpenMeetingRequests: 5,
  });
  await createDay(event.id, {
    start: new Date(`${DAY}T09:00:00.000Z`),
    end: new Date(`${DAY}T17:00:00.000Z`),
  });
  const ada = await createGuest({ name: "Ada", eventId: event.id });
  const grace = await createGuest({ name: "Grace", eventId: event.id });
  await repos.meetingAvailability.replaceForGuest(grace.id, event.id, [
    new Date(SLOT),
    new Date(SLOT_2),
  ]);
  return { event, ada, grace };
}

const ask = (eventId: string, from: string, to: string, slotStart = SLOT) =>
  meetings().requestMeeting(
    open(from),
    {
      eventId,
      recipientId: to,
      slotStart,
      slotCount: 1,
      meetingPoint: " Coffee bar ",
      message: "Hi",
    },
    now()
  );

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  notifyMeetingRequested.mockClear();
  notifyMeetingOutcome.mockClear();
});

describe("asking for a 1-on-1", () => {
  it(
    "creates a pending request and tells the recipient",
    { tags: ["012-US3"] },
    async () => {
      const { event, ada, grace } = await scenario();

      const meeting = value(await ask(event.id, ada.id, grace.id));

      expect(meeting).toMatchObject({
        requesterId: ada.id,
        recipientId: grace.id,
        status: "pending",
        meetingPoint: "Coffee bar",
      });
      expect(meeting.slotEnd.toISOString()).toBe(SLOT_2);
      expect(notifyMeetingRequested).toHaveBeenCalledWith(
        expect.objectContaining({ meeting })
      );
    }
  );

  it(
    "refuses a slot the recipient did not declare, and a second ask for the same one",
    { tags: ["012-US3"] },
    async () => {
      const { event, ada, grace } = await scenario();

      expect(code(await ask(event.id, grace.id, ada.id))).toBe(
        "meeting.recipientUnavailable"
      );
      value(await ask(event.id, ada.id, grace.id));
      const again = await ask(event.id, ada.id, grace.id);
      expect(again.ok || again.error).toMatchObject({
        kind: "conflict",
        code: "meeting.duplicate",
      });
    }
  );

  it(
    "acts only as a guest the caller may act as",
    { tags: ["012-US3"] },
    async () => {
      const { event, ada, grace } = await scenario();
      await protect(ada.id);
      const input = {
        eventId: event.id,
        recipientId: grace.id,
        slotStart: SLOT,
        slotCount: 1,
        meetingPoint: "Coffee bar",
      };

      expect(code(await meetings().requestMeeting(NOBODY, input, now()))).toBe(
        "guest.unselected"
      );
      expect(
        code(await meetings().requestMeeting(open(ada.id), input, now()))
      ).toBe("guest.protected");
      expect(
        code(await meetings().requestMeeting(verified(ada.id), input, now()))
      ).toBe("ok");
    }
  );
});

describe("asking while the recipient is deleted", () => {
  it(
    "refuses the request or loses it with them, never failing",
    { tags: ["012-US3", "019-US7"] },
    async () => {
      const { event, ada, grace } = await scenario();

      const repos = getRepositories();
      const read = repos.meetingAvailability.listByGuestAndEvent.bind(
        repos.meetingAvailability
      );
      let checking = () => {};
      const checked = new Promise<void>((resolve) => (checking = resolve));
      let deleted = () => {};
      const gone = new Promise<void>((resolve) => (deleted = resolve));
      const slowRead = vi
        .spyOn(repos.meetingAvailability, "listByGuestAndEvent")
        .mockImplementationOnce(async (guestId, eventId) => {
          checking();
          const declared = await read(guestId, eventId);
          await gone;
          return declared;
        });

      const asking = ask(event.id, ada.id, grace.id);
      await Promise.race([checked, asking]);
      await repos.guests.delete(grace.id);
      deleted();
      const asked = await asking;
      slowRead.mockRestore();

      expect(["ok", "meeting.recipientNotInEvent"]).toContain(code(asked));
      expect(
        await getRepositories().meetings.listByGuestAndEvent(ada.id, event.id)
      ).toEqual([]);
    }
  );
});

describe("answering and calling off", () => {
  it(
    "lets only the person asked answer, and tells the requester",
    { tags: ["012-US4"] },
    async () => {
      const { event, ada, grace } = await scenario();
      const meeting = value(await ask(event.id, ada.id, grace.id));

      expect(
        code(
          await meetings().respondToMeeting(
            open(ada.id),
            { meetingId: meeting.id, response: "accept" },
            now()
          )
        )
      ).toBe("meeting.notRecipient");
      const answered = value(
        await meetings().respondToMeeting(
          open(grace.id),
          { meetingId: meeting.id, response: "accept" },
          now()
        )
      );

      expect(answered.meeting.status).toBe("accepted");
      expect(answered.eventSlug).toBe(event.slug);
      expect(notifyMeetingOutcome).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: "accepted", actorId: grace.id })
      );
      expect(
        code(
          await meetings().respondToMeeting(
            open(grace.id),
            { meetingId: meeting.id, response: "decline" },
            now()
          )
        )
      ).toBe("meeting.alreadyAnswered");
    }
  );

  it(
    "lets either party cancel an agreed meeting, but nobody else",
    { tags: ["012-US4"] },
    async () => {
      const { event, ada, grace } = await scenario();
      const outsider = await createGuest({ eventId: event.id });
      const meeting = value(await ask(event.id, ada.id, grace.id));
      const cancel = (guestId: string) =>
        meetings().cancelMeeting(
          open(guestId),
          { meetingId: meeting.id, note: " Sorry " },
          now()
        );

      expect(code(await cancel(grace.id))).toBe("meeting.recipientMustDecline");
      await meetings().respondToMeeting(
        open(grace.id),
        { meetingId: meeting.id, response: "accept" },
        now()
      );
      expect(code(await cancel(outsider.id))).toBe("meeting.notParticipant");

      const canceled = value(await cancel(grace.id));
      expect(canceled.meeting).toMatchObject({
        status: "canceled",
        cancelNote: "Sorry",
      });
      expect(code(await cancel(ada.id))).toBe("meeting.nothingToCancel");
    }
  );
});

describe("reading one's own 1-on-1s", () => {
  it(
    "serves the caller's own meetings and availability, never another pair's",
    { tags: ["012-US5"] },
    async () => {
      const { event, ada, grace } = await scenario();
      const outsider = await createGuest({ eventId: event.id });
      value(await ask(event.id, ada.id, grace.id));

      const mine = value(
        await meetings().listMyMeetings(
          open(grace.id),
          { eventId: event.id },
          now()
        )
      );
      expect(mine.meetings).toEqual([
        expect.objectContaining({ role: "recipient", otherName: "Ada" }),
      ]);
      expect(mine.availability).toEqual([SLOT, SLOT_2]);

      const theirs = value(
        await meetings().listMyMeetings(
          open(outsider.id),
          { eventId: event.id },
          now()
        )
      );
      expect(theirs).toEqual({ meetings: [], availability: [] });
    }
  );

  it(
    "refuses an anonymous or unverified protected caller, and an unknown event",
    { tags: ["012-US5"] },
    async () => {
      const { event, grace } = await scenario();
      await protect(grace.id);
      const list = (actor: Actor, eventId = event.id) =>
        meetings().listMyMeetings(actor, { eventId }, now());

      expect(code(await list(NOBODY))).toBe("guest.unselected");
      expect(code(await list(open(grace.id)))).toBe("guest.protected");
      expect(code(await list(verified(grace.id), "nope"))).toBe(
        "event.notFound"
      );
    }
  );

  it(
    "offers the people free in a slot, and nothing for a slot not on offer",
    { tags: ["012-US6"] },
    async () => {
      const { event, ada } = await scenario();
      const candidates = (slotStart: string) =>
        meetings().listMeetingCandidates(
          open(ada.id),
          { eventId: event.id, slotStart, slotCount: 1 },
          now()
        );

      expect(value(await candidates(SLOT)).candidates).toEqual([
        expect.objectContaining({ name: "Grace", busy: false }),
      ]);
      expect(code(await candidates(`${DAY}T20:00:00.000Z`))).toBe(
        "meeting.slotNotOpen"
      );
      expect(
        code(
          await meetings().listMeetingCandidates(
            NOBODY,
            { eventId: event.id, slotStart: SLOT, slotCount: 1 },
            now()
          )
        )
      ).toBe("guest.unselected");
    }
  );
});

describe("declaring availability", () => {
  it(
    "replaces the caller's declared slots with ones the event offers",
    { tags: ["012-US2"] },
    async () => {
      const { event, ada } = await scenario();
      const save = (slotStarts: string[]) =>
        meetings().saveMeetingAvailability(
          open(ada.id),
          { eventId: event.id, slotStarts },
          now()
        );

      value(await save([SLOT_2, SLOT_2]));
      expect(
        await getRepositories().meetingAvailability.listByGuestAndEvent(
          ada.id,
          event.id
        )
      ).toEqual([new Date(SLOT_2)]);
      expect(code(await save([`${DAY}T10:10:00.000Z`]))).toBe(
        "meeting.slotsUnavailable"
      );
    }
  );

  it(
    "refuses a guest who is not attending, and an event without 1-on-1s",
    { tags: ["012-US2"] },
    async () => {
      const { event } = await scenario();
      const other = await createEvent({ phase: "scheduling" });
      const stranger = await createGuest({ eventId: other.id });

      expect(
        code(
          await meetings().saveMeetingAvailability(
            open(stranger.id),
            { eventId: event.id, slotStarts: [] },
            now()
          )
        )
      ).toBe("guest.notInEvent");
      expect(
        code(
          await meetings().saveMeetingAvailability(
            open(stranger.id),
            { eventId: other.id, slotStarts: [] },
            now()
          )
        )
      ).toBe("event.meetingsDisabled");
    }
  );

  it(
    "keeps no slot off the grid the organizer changes at the same moment",
    { tags: ["012-US2", "015-US2", "019-US7"] },
    async () => {
      const { event, ada } = await scenario();
      const { version } = (await getRepositories().events.findById(event.id))!;

      const [, changed] = await Promise.all([
        meetings().saveMeetingAvailability(
          open(ada.id),
          { eventId: event.id, slotStarts: [SLOT_2] },
          now()
        ),
        createEventUseCases({
          repos: getRepositories(),
          uow: unitOfWork,
        }).updateEvent(
          { admin: true, guest: null },
          {
            id: event.id,
            expectedVersion: version,
            name: event.name,
            description: "",
            website: "",
            timezone: "UTC",
            maxSessionDuration: 120,
            breakMinutes: 0,
            slotIncrementMinutes: 60,
          },
          now()
        ),
      ]);

      expect(code(changed)).toBe("ok");
      expect(
        await getRepositories().meetingAvailability.listByGuestAndEvent(
          ada.id,
          event.id
        )
      ).toEqual([]);
    }
  );
});

describe("organizer settings", () => {
  it(
    "switches 1-on-1s on with a request cap, and refuses a cap below one",
    { tags: ["012-US1"] },
    async () => {
      const event = await createEvent();
      const update = async (actor: Actor, cap?: number) =>
        meetings().updateEventMeetings(
          actor,
          {
            eventId: event.id,
            meetingsEnabled: true,
            maxOpenMeetingRequests: cap,
            expectedVersion: (await getRepositories().events.findById(
              event.id
            ))!.version,
          },
          now()
        );

      expect(code(await update(open("x"), 3))).toBe("admin.required");
      expect(code(await update(ADMIN, 0))).toBe("meeting.capInvalid");
      expect(code(await update(ADMIN))).toBe("meeting.capInvalid");
      value(await update(ADMIN, 3));
      expect(await getRepositories().events.findById(event.id)).toMatchObject({
        meetingsEnabled: true,
        maxOpenMeetingRequests: 3,
      });
      expect(
        code(
          await meetings().updateEventMeetings(
            ADMIN,
            {
              eventId: "nope",
              meetingsEnabled: false,
              expectedVersion: 1,
            },
            now()
          )
        )
      ).toBe("event.notFound");
    }
  );

  it(
    "orders meeting points added at the same moment one after the other",
    { tags: ["012-US1", "019-US7"] },
    async () => {
      const event = await createEvent();

      const points = await Promise.all(
        ["Coffee bar", "Lobby"].map(async (name) =>
          value(
            await meetings().createMeetingPoint(ADMIN, {
              eventId: event.id,
              name,
            })
          )
        )
      );

      expect(points.map((p) => p.sortIndex).sort()).toEqual([0, 1]);
    }
  );

  it(
    "adds, renames and deletes meeting points within one event only",
    { tags: ["012-US1"] },
    async () => {
      const event = await createEvent();
      const other = await createEvent();
      const point = value(
        await meetings().createMeetingPoint(ADMIN, {
          eventId: event.id,
          name: " Coffee bar ",
        })
      );
      expect(point).toMatchObject({ name: "Coffee bar", description: "" });
      expect(
        code(
          await meetings().createMeetingPoint(ADMIN, {
            eventId: event.id,
            name: " ",
          })
        )
      ).toBe("meetingPoint.nameRequired");
      expect(
        code(
          await meetings().createMeetingPoint(open("x"), {
            eventId: event.id,
            name: "Lobby",
          })
        )
      ).toBe("admin.required");

      expect(
        code(
          await meetings().updateMeetingPoint(ADMIN, {
            eventId: other.id,
            id: point.id,
            expectedVersion: point.version,
            name: "Lobby",
          })
        )
      ).toBe("meetingPoint.notFound");
      expect(
        value(
          await meetings().updateMeetingPoint(ADMIN, {
            eventId: event.id,
            id: point.id,
            expectedVersion: point.version,
            name: "Lobby",
            description: " By the door ",
          })
        )
      ).toMatchObject({ name: "Lobby", description: "By the door" });

      expect(
        code(
          await meetings().deleteMeetingPoint(ADMIN, {
            eventId: other.id,
            id: point.id,
          })
        )
      ).toBe("meetingPoint.notFound");
      value(
        await meetings().deleteMeetingPoint(ADMIN, {
          eventId: event.id,
          id: point.id,
        })
      );
      expect(
        await getRepositories().meetingPoints.listByEvent(event.id)
      ).toEqual([]);
    }
  );
});
