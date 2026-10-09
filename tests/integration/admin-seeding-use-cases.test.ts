import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { uowFailingAt } from "../helpers/changes";
import { getRepositories } from "@/db/container";
import { unitOfWork, type UnitOfWork } from "@/server/kernel/unit-of-work";
import { createEventUseCases } from "@/server/modules/events/module";
import { createProposalUseCases } from "@/server/modules/proposals/module";
import { createSessionUseCases } from "@/server/modules/sessions/module";
import { createVenueUseCases } from "@/server/modules/venue/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

const ADMIN: Actor = { admin: true, guest: null };
const NOBODY: Actor = { admin: false, guest: null };
const NOW = new Date();
const DAY = isoDay(30);
const at = (time: string) => new Date(`${DAY}T${time}:00.000Z`);
const PAST = new Date("2020-03-01T10:00:00.000Z");
const PAST_END = new Date("2020-03-01T11:00:00.000Z");

const notifyCohostsAdded = vi.fn(async () => {});
const events = () => createEventUseCases({ repos: getRepositories() });
const venue = () =>
  createVenueUseCases({
    repos: getRepositories(),
    images: {
      validate: (buffer) => Promise.resolve({ buffer, ext: "png" }),
      save: (id) => Promise.resolve(`/media/locations/${id}.png`),
      delete: async () => {},
    },
  });
const sessions = (uow: UnitOfWork = unitOfWork) =>
  createSessionUseCases({
    repos: getRepositories(),
    notifyCohostsAdded,
    uow,
  });
const proposals = () =>
  createProposalUseCases({
    repos: getRepositories(),
    notifyProposalJoined: () => {},
  });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}
const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

const settings = {
  name: "Seeded Camp",
  description: "",
  website: "",
  timezone: "UTC",
  maxSessionDuration: 120,
  breakMinutes: 10,
  slotIncrementMinutes: 30,
};
const dayWindow = {
  start: at("08:00"),
  end: at("18:00"),
  startBookings: at("09:00"),
  endBookings: at("17:00"),
};
const seed = {
  title: "Imported talk",
  description: "",
  startTime: PAST,
  endTime: PAST_END,
  hostIds: [] as string[],
  locationIds: [] as string[],
  adminManaged: false,
  closed: false,
};

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.clearAllMocks();
});

describe("admin seeding: events, days and locations", () => {
  it(
    "creates an event with its scheduling phase, checking the dates before the name's URL",
    { tags: ["015-US2", "019-US3"] },
    async () => {
      const created = value(
        await events().createEvent(ADMIN, {
          ...settings,
          phases: { schedulingPhaseStart: PAST, schedulingPhaseEnd: PAST_END },
        })
      );
      expect(created).toMatchObject({
        schedulingPhaseStart: PAST,
        schedulingPhaseEnd: PAST_END,
      });

      const reserved = { ...settings, name: "admin" };
      const badDate = await events().createEvent(ADMIN, {
        ...reserved,
        phases: { schedulingPhaseStart: new Date("nope") },
      });
      expect(badDate.ok || badDate.error).toMatchObject({
        code: "event.phaseDateInvalid",
        detail: "Invalid scheduling phase start",
      });
      const reversed = await events().createEvent(ADMIN, {
        ...reserved,
        phases: { schedulingPhaseStart: PAST_END, schedulingPhaseEnd: PAST },
      });
      expect(reversed.ok || reversed.error).toMatchObject({
        code: "event.phasesOutOfOrder",
        detail: "Scheduling phase end must be after its start",
      });
      expect(code(await events().createEvent(ADMIN, reserved))).toBe(
        "event.slugReserved"
      );
    }
  );

  it(
    "adds a day to an event found by its URL, after checking the window",
    { tags: ["015-US4", "019-US3"] },
    async () => {
      const event = await createEvent();
      const day = value(
        await events().createDay(ADMIN, { ...dayWindow, eventSlug: event.slug })
      );
      expect(day.eventId).toBe(event.id);
      expect(
        code(
          await events().createDay(ADMIN, {
            ...dayWindow,
            start: undefined,
            eventSlug: "missing",
          })
        )
      ).toBe("day.dateInvalid");
      expect(
        code(
          await events().createDay(ADMIN, {
            ...dayWindow,
            eventSlug: "missing",
          })
        )
      ).toBe("event.notFound");
    }
  );

  it(
    "adds a new location to an event found by its URL, after checking the fields",
    { tags: ["017-US1", "019-US3"] },
    async () => {
      const event = await createEvent();
      const location = value(
        await venue().createLocation(ADMIN, {
          name: "Hall",
          capacity: 40,
          eventSlug: event.slug,
        })
      );
      expect(location.eventIds).toEqual([event.id]);
      expect(
        (await getRepositories().locations.listByEvent(event.id)).map(
          (l) => l.id
        )
      ).toEqual([location.id]);

      expect(
        code(
          await venue().createLocation(ADMIN, {
            name: "",
            capacity: 1,
            eventSlug: "missing",
          })
        )
      ).toBe("location.invalid");
      expect(
        code(
          await venue().createLocation(ADMIN, {
            name: "Annex",
            capacity: 1,
            eventSlug: "missing",
          })
        )
      ).toBe("event.notFound");
      expect(await getRepositories().locations.list()).toHaveLength(1);
    }
  );
});

describe("admin seeding: sessions", () => {
  it("refuses everyone but an organizer", { tags: ["018-US2"] }, async () => {
    const event = await createEvent();
    expect(
      code(
        await sessions().adminSeedSession(NOBODY, {
          ...seed,
          eventSlug: event.slug,
        })
      )
    ).toBe("admin.required");
  });

  it(
    "seeds a past session outside any phase, adding its hosts and rooms to the event without notifying",
    { tags: ["018-US2", "019-US5"] },
    async () => {
      const event = await createEvent({ phase: "proposal" });
      const host = await createGuest();
      const room = await createLocation({ capacity: 25 });
      const session = value(
        await sessions().adminSeedSession(ADMIN, {
          ...seed,
          eventSlug: event.slug,
          hostIds: [host.id],
          locationIds: [room.id],
        })
      );
      expect(session).toMatchObject({
        eventId: event.id,
        startTime: PAST,
        endTime: PAST_END,
        capacity: 25,
      });
      const repos = getRepositories();
      expect(
        (await repos.guests.listByEvent(event.id)).map((g) => g.id)
      ).toEqual([host.id]);
      expect(
        (await repos.locations.listByEvent(event.id)).map((l) => l.id)
      ).toEqual([room.id]);
      expect(notifyCohostsAdded).not.toHaveBeenCalled();

      expect(
        value(
          await sessions().adminSeedSession(ADMIN, {
            ...seed,
            eventSlug: event.slug,
            capacity: 3,
          })
        ).capacity
      ).toBe(3);
      expect(
        value(
          await sessions().adminSeedSession(ADMIN, {
            ...seed,
            eventSlug: event.slug,
          })
        ).capacity
      ).toBe(0);
    }
  );

  it(
    "seeds nothing when adding its rooms to the event fails",
    { tags: ["018-US2", "019-US5", "019-US7"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest();
      const room = await createLocation();

      await expect(
        sessions(uowFailingAt("locations", "assignToEvent")).adminSeedSession(
          ADMIN,
          {
            ...seed,
            eventSlug: event.slug,
            hostIds: [host.id],
            locationIds: [room.id],
          }
        )
      ).rejects.toThrow("locations.assignToEvent failed");

      const repos = getRepositories();
      expect(await repos.sessions.listByEvent(event.id)).toEqual([]);
      expect(await repos.guests.listByEvent(event.id)).toEqual([]);
      expect(await repos.locations.listByEvent(event.id)).toEqual([]);
      expect(await repos.changes.listAfter(0)).toEqual([]);
    }
  );

  it(
    "refuses a seeded session in the legacy order",
    { tags: ["018-US2", "019-US5"] },
    async () => {
      const event = await createEvent();
      const room = await createLocation();
      await createSession(event.id, {
        title: "Existing",
        startTime: PAST,
        endTime: PAST_END,
        locationIds: [room.id],
      });
      const attempt = async (input: Partial<typeof seed> & object) =>
        sessions().adminSeedSession(ADMIN, {
          ...seed,
          eventSlug: event.slug,
          ...input,
        });
      const refusal = async (input: Partial<typeof seed> & object) => {
        const result = await attempt(input);
        return result.ok ? "ok" : [result.error.code, result.error.detail];
      };

      expect(await refusal({ title: " ", startTime: undefined })).toEqual([
        "session.titleRequired",
        "Title is required",
      ]);
      expect(await refusal({ startTime: new Date("nope") })).toEqual([
        "session.timeRangeInvalid",
        "Invalid start time",
      ]);
      expect(await refusal({ endTime: undefined })).toEqual([
        "session.timeRangeInvalid",
        "Invalid end time",
      ]);
      expect(await refusal({ endTime: PAST })).toEqual([
        "session.timeRangeInvalid",
        "End time must be after start time",
      ]);
      expect(
        code(
          await sessions().adminSeedSession(ADMIN, {
            ...seed,
            eventSlug: "missing",
            hostIds: ["nobody"],
          })
        )
      ).toBe("event.notFound");
      expect(
        await refusal({ hostIds: ["nobody"], locationIds: ["nowhere"] })
      ).toEqual(["session.hostUnknown", "Unknown host"]);
      expect(await refusal({ locationIds: ["nowhere"] })).toEqual([
        "session.locationUnknown",
        "Unknown location",
      ]);
      expect(
        await refusal({ capacity: -1, locationIds: [room.id] } as object)
      ).toEqual([
        "session.capacityInvalid",
        "Capacity must be a non-negative whole number",
      ]);
      expect(await refusal({ locationIds: [room.id] })).toEqual([
        "session.clash",
        'Overlaps "Existing" in the same location',
      ]);
    }
  );
});

describe("admin seeding: proposals and RSVPs", () => {
  it(
    "creates a proposal in any phase, adding its hosts to the event",
    { tags: ["018-US1", "019-US5"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const host = await createGuest();
      const input = {
        title: " Seeded idea ",
        description: "",
        durationMinutes: 45,
        hostIds: [host.id, host.id],
      };
      expect(
        code(
          await proposals().adminCreateProposal(
            NOBODY,
            { ...input, event: { id: event.id } },
            NOW
          )
        )
      ).toBe("admin.required");

      const created = value(
        await proposals().adminCreateProposal(
          ADMIN,
          { ...input, event: { slug: event.slug } },
          NOW
        )
      );
      expect(created).toMatchObject({
        title: "Seeded idea",
        description: undefined,
        durationMinutes: 45,
        hosts: [{ id: host.id }],
        createdTime: NOW,
      });
      expect(
        (await getRepositories().guests.listByEvent(event.id)).map((g) => g.id)
      ).toEqual([host.id]);

      const refusal = async (
        fields: Partial<typeof input>,
        ref: { slug: string } | { id: string } = { id: event.id }
      ) => {
        const result = await proposals().adminCreateProposal(
          ADMIN,
          { ...input, ...fields, event: ref },
          NOW
        );
        return result.ok ? "ok" : [result.error.code, result.error.detail];
      };
      expect(await refusal({ title: "", durationMinutes: -1 })).toEqual([
        "proposal.titleRequired",
        "Title is required",
      ]);
      expect(await refusal({ durationMinutes: 1.5 }, { slug: "x" })).toEqual([
        "proposal.durationInvalid",
        "Duration must be a non-negative integer",
      ]);
      expect(await refusal({ hostIds: ["nobody"] }, { slug: "x" })).toEqual([
        "event.notFound",
        "Event not found",
      ]);
      expect(await refusal({ hostIds: ["nobody"] })).toEqual([
        "proposal.hostUnknown",
        "Guest not found: nobody",
      ]);
    }
  );

  it(
    "adds an RSVP outside the scheduling phase once, adding the guest to the event",
    { tags: ["018-US3", "019-US5"] },
    async () => {
      const event = await createEvent({ phase: "proposal" });
      const session = await createSession(event.id);
      const guest = await createGuest();
      const input = { sessionId: session.id, guestId: guest.id };
      expect(code(await sessions().adminAddRsvp(NOBODY, input))).toBe(
        "admin.required"
      );

      const first = value(await sessions().adminAddRsvp(ADMIN, input));
      expect(first).toMatchObject({ created: true, rsvp: input });
      expect(value(await sessions().adminAddRsvp(ADMIN, input))).toEqual({
        created: false,
        rsvp: first.rsvp,
      });
      expect(
        (await getRepositories().guests.listByEvent(event.id)).map((g) => g.id)
      ).toEqual([guest.id]);

      expect(
        code(
          await sessions().adminAddRsvp(ADMIN, {
            sessionId: "missing",
            guestId: "nobody",
          })
        )
      ).toBe("session.notFound");
      expect(
        code(
          await sessions().adminAddRsvp(ADMIN, {
            sessionId: session.id,
            guestId: "nobody",
          })
        )
      ).toBe("guest.notFound");
    }
  );

  it(
    "adds no RSVP when adding the guest to the event fails",
    { tags: ["018-US3", "019-US5", "019-US7"] },
    async () => {
      const event = await createEvent();
      const session = await createSession(event.id);
      const guest = await createGuest();

      await expect(
        sessions(uowFailingAt("guests", "assignToEvent")).adminAddRsvp(ADMIN, {
          sessionId: session.id,
          guestId: guest.id,
        })
      ).rejects.toThrow("guests.assignToEvent failed");

      const repos = getRepositories();
      expect(await repos.rsvps.listBySession(session.id)).toEqual([]);
      expect(await repos.guests.listByEvent(event.id)).toEqual([]);
      expect(await repos.changes.listAfter(0)).toEqual([]);
    }
  );

  it(
    "keeps a hard capacity limit, but re-adding an existing RSVP still succeeds",
    { tags: ["018-US3", "019-US5"] },
    async () => {
      const event = await createEvent({ rsvpCapacityHardLimit: true });
      const session = await createSession(event.id, { capacity: 1 });
      const [first, second] = [await createGuest(), await createGuest()];
      value(
        await sessions().adminAddRsvp(ADMIN, {
          sessionId: session.id,
          guestId: first.id,
        })
      );
      expect(
        code(
          await sessions().adminAddRsvp(ADMIN, {
            sessionId: session.id,
            guestId: second.id,
          })
        )
      ).toBe("session.full");
      expect(
        value(
          await sessions().adminAddRsvp(ADMIN, {
            sessionId: session.id,
            guestId: first.id,
          })
        ).created
      ).toBe(false);
    }
  );
});
