import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createEventUseCases } from "@/server/modules/events/module";
import { createVenueUseCases } from "@/server/modules/venue/module";
import { createSessionUseCases } from "@/server/modules/sessions/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

const ADMIN: Actor = { admin: true, guest: null };
const NOBODY: Actor = { admin: false, guest: null };
const DAY = isoDay(30);
const at = (time: string) => new Date(`${DAY}T${time}:00.000Z`);

const images = {
  validate: vi.fn((buffer: Buffer) =>
    Promise.resolve<{ buffer: Buffer; ext: string } | { error: string }>({
      buffer,
      ext: "png",
    })
  ),
  save: vi.fn((id: string) => Promise.resolve(`/media/locations/${id}.png`)),
  delete: vi.fn(async () => {}),
};
const events = () => createEventUseCases({ repos: getRepositories() });
const venue = () => createVenueUseCases({ repos: getRepositories(), images });
const sessions = () =>
  createSessionUseCases({
    repos: getRepositories(),
    notifyCohostsAdded: async () => {},
    uow: unitOfWork,
  });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}
const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

const settings = {
  name: "Unconference",
  description: "",
  website: "example.org",
  timezone: "Europe/Berlin",
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
const noPhases = {
  proposalPhaseStart: undefined,
  proposalPhaseEnd: undefined,
  votingPhaseStart: undefined,
  votingPhaseEnd: undefined,
  schedulingPhaseStart: undefined,
  schedulingPhaseEnd: undefined,
};

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.clearAllMocks();
});

describe("event use cases", () => {
  it(
    "refuses everyone but an organizer",
    { tags: ["015-US2", "015-US3", "015-US4"] },
    async () => {
      const event = await createEvent();
      const day = await createDay(event.id);
      const refusals = [
        await events().listEvents(NOBODY),
        await events().getEvent(NOBODY, { id: event.id }),
        await events().createEvent(NOBODY, settings),
        await events().updateEvent(NOBODY, { ...settings, id: event.id }),
        await events().updateEventPhases(NOBODY, { ...noPhases, id: event.id }),
        await events().deleteEvent(NOBODY, { id: event.id }),
        await events().createDay(NOBODY, { ...dayWindow, eventId: event.id }),
        await events().updateDay(NOBODY, { ...dayWindow, id: day.id }),
        await events().deleteDay(NOBODY, { id: day.id }),
      ];
      expect(refusals.map(code)).toEqual(
        Array(refusals.length).fill("admin.required")
      );
      expect(await getRepositories().events.findById(event.id)).toBeDefined();
    }
  );

  it(
    "creates an event and reads it back with its days",
    { tags: ["015-US2", "019-US3"] },
    async () => {
      const event = value(await events().createEvent(ADMIN, settings));
      expect(event).toMatchObject({
        slug: "Unconference",
        website: "https://example.org",
        timezone: "Europe/Berlin",
        rsvpCapacityHardLimit: false,
      });
      const day = value(
        await events().createDay(ADMIN, { ...dayWindow, eventId: event.id })
      );

      expect(value(await events().listEvents(ADMIN))).toMatchObject([
        { id: event.id },
      ]);
      expect(value(await events().getEvent(ADMIN, { id: event.id }))).toEqual({
        event: expect.objectContaining({
          id: event.id,
          firstDayStart: day.start,
        }) as unknown,
        days: [day],
      });
      expect(code(await events().getEvent(ADMIN, { id: "nope" }))).toBe(
        "event.notFound"
      );
    }
  );

  it(
    "refuses a taken, reserved or empty URL, an unknown icon or time zone",
    { tags: ["015-US2"] },
    async () => {
      value(await events().createEvent(ADMIN, settings));
      const taken = await events().createEvent(ADMIN, settings);
      expect(taken).toEqual({
        ok: false,
        error: {
          kind: "conflict",
          code: "event.slugTaken",
          detail: `An event with the URL "Unconference" already exists ("Unconference")`,
        },
      });
      expect(
        code(await events().createEvent(ADMIN, { ...settings, name: "admin" }))
      ).toBe("event.slugReserved");
      expect(
        code(await events().createEvent(ADMIN, { ...settings, name: "!!" }))
      ).toBe("event.slugEmpty");
      expect(
        code(await events().createEvent(ADMIN, { ...settings, name: " " }))
      ).toBe("event.nameRequired");
      expect(
        code(
          await events().createEvent(ADMIN, { ...settings, icon: "Unknown" })
        )
      ).toBe("event.iconUnknown");
      expect(
        code(
          await events().createEvent(ADMIN, {
            ...settings,
            timezone: "Mars/Base",
          })
        )
      ).toBe("event.timezoneUnknown");
    }
  );

  it(
    "changes the slot increment only when every day stays on the grid",
    { tags: ["015-US2"] },
    async () => {
      const event = await createEvent({ slotIncrementMinutes: 15 });
      await createDay(event.id, dayWindow);
      const guest = await createGuest({ eventId: event.id });
      const repos = getRepositories();
      await repos.meetingAvailability.replaceForGuest(guest.id, event.id, [
        at("10:00"),
      ]);

      const misaligned = await events().updateEvent(ADMIN, {
        ...settings,
        id: event.id,
        slotIncrementMinutes: 45,
      });
      expect(misaligned).toMatchObject({
        ok: false,
        error: { kind: "conflict", code: "event.slotIncrementMisaligned" },
      });

      const coarser = value(
        await events().updateEvent(ADMIN, {
          ...settings,
          id: event.id,
          slotIncrementMinutes: 60,
        })
      );
      expect(coarser.slotIncrementMinutes).toBe(60);
      expect(
        await repos.meetingAvailability.listByGuestAndEvent(guest.id, event.id)
      ).toEqual([]);
      expect(
        code(await events().updateEvent(ADMIN, { ...settings, id: "nope" }))
      ).toBe("event.notFound");
    }
  );

  it(
    "sets, checks and clears the phase dates",
    { tags: ["015-US3"] },
    async () => {
      const event = await createEvent();
      const set = value(
        await events().updateEventPhases(ADMIN, {
          ...noPhases,
          id: event.id,
          proposalPhaseStart: at("08:00"),
          votingPhaseStart: at("12:00"),
        })
      );
      expect(set).toMatchObject({
        proposalPhaseStart: at("08:00"),
        votingPhaseStart: at("12:00"),
      });
      expect(set.schedulingPhaseStart).toBeUndefined();

      const outOfOrder = await events().updateEventPhases(ADMIN, {
        ...noPhases,
        id: event.id,
        proposalPhaseStart: at("12:00"),
        votingPhaseStart: at("08:00"),
      });
      expect(outOfOrder).toEqual({
        ok: false,
        error: {
          kind: "invalid",
          code: "event.phasesOutOfOrder",
          detail: "Voting phase must not start before proposal phase starts",
        },
      });
      expect(
        code(
          await events().updateEventPhases(ADMIN, {
            ...noPhases,
            id: event.id,
            votingPhaseEnd: new Date("nonsense"),
          })
        )
      ).toBe("event.phaseDateInvalid");
      expect(
        code(
          await events().updateEventPhases(ADMIN, { ...noPhases, id: "nope" })
        )
      ).toBe("event.notFound");
    }
  );

  it("deletes an event", { tags: ["015-US2"] }, async () => {
    const event = await createEvent();
    value(await events().deleteEvent(ADMIN, { id: event.id }));
    expect(code(await events().getEvent(ADMIN, { id: event.id }))).toBe(
      "event.notFound"
    );
    expect(code(await events().deleteEvent(ADMIN, { id: event.id }))).toBe(
      "event.notFound"
    );
  });
});

describe("day use cases", () => {
  it(
    "adds days that neither overlap nor leave the slot grid",
    { tags: ["015-US4"] },
    async () => {
      const event = await createEvent();
      value(
        await events().createDay(ADMIN, { ...dayWindow, eventId: event.id })
      );
      expect(
        code(
          await events().createDay(ADMIN, { ...dayWindow, eventId: event.id })
        )
      ).toBe("day.overlap");
      expect(
        code(
          await events().createDay(ADMIN, {
            ...dayWindow,
            eventId: event.id,
            end: at("17:50"),
          })
        )
      ).toBe("day.misaligned");
      expect(
        code(
          await events().createDay(ADMIN, {
            ...dayWindow,
            eventId: event.id,
            start: undefined,
          })
        )
      ).toBe("day.dateInvalid");
      expect(
        code(
          await events().createDay(ADMIN, {
            ...dayWindow,
            eventId: event.id,
            startBookings: at("07:00"),
          })
        )
      ).toBe("day.windowInvalid");
      expect(
        code(await events().createDay(ADMIN, { ...dayWindow, eventId: "nope" }))
      ).toBe("event.notFound");
    }
  );

  it(
    "resizes a day only while its sessions stay inside it",
    { tags: ["015-US4"] },
    async () => {
      const event = await createEvent();
      const day = await createDay(event.id, dayWindow);
      await createSession(event.id, {
        title: "Late talk",
        startTime: at("16:00"),
        endTime: at("17:00"),
      });

      const shrunk = await events().updateDay(ADMIN, {
        ...dayWindow,
        id: day.id,
        end: at("16:00"),
        endBookings: at("16:00"),
      });
      expect(shrunk).toEqual({
        ok: false,
        error: {
          kind: "conflict",
          code: "day.sessionsOutside",
          detail:
            'Cannot resize this day: "Late talk" would fall outside the new window. Reschedule or delete it first.',
        },
      });

      const grown = value(
        await events().updateDay(ADMIN, {
          ...dayWindow,
          id: day.id,
          end: at("19:00"),
        })
      );
      expect(grown).toMatchObject({ id: day.id, end: at("19:00") });
      expect(
        code(await events().updateDay(ADMIN, { ...dayWindow, id: "nope" }))
      ).toBe("day.notFound");
    }
  );

  it("deletes a day", { tags: ["015-US4"] }, async () => {
    const event = await createEvent();
    const day = await createDay(event.id);
    expect(value(await events().deleteDay(ADMIN, { id: day.id }))).toEqual(day);
    expect(code(await events().deleteDay(ADMIN, { id: day.id }))).toBe(
      "day.notFound"
    );
  });
});

describe("venue use cases", () => {
  const room = { name: "Main Hall", capacity: 50, color: "teal" };

  it(
    "refuses everyone but an organizer",
    { tags: ["017-US1", "017-US3"] },
    async () => {
      const event = await createEvent();
      const location = await createLocation();
      const refusals = [
        await venue().listLocations(NOBODY, {}),
        await venue().createLocation(NOBODY, room),
        await venue().updateLocation(NOBODY, { ...room, id: location.id }),
        await venue().deleteLocation(NOBODY, { id: location.id }),
        await venue().moveLocation(NOBODY, {
          id: location.id,
          direction: "up",
        }),
        await venue().assignLocationsToEvent(NOBODY, {
          eventId: event.id,
          locationIds: [location.id],
        }),
        await venue().removeLocationsFromEvent(NOBODY, {
          eventId: event.id,
          locationIds: [location.id],
        }),
      ];
      expect(refusals.map(code)).toEqual(
        Array(refusals.length).fill("admin.required")
      );
    }
  );

  it(
    "creates locations, hidden ones included in the organizer's list",
    { tags: ["017-US1", "017-US3", "019-US3"] },
    async () => {
      const event = await createEvent();
      const hall = value(
        await venue().createLocation(ADMIN, {
          ...room,
          eventIds: [event.id, event.id],
        })
      );
      const store = value(
        await venue().createLocation(ADMIN, {
          ...room,
          name: "Store",
          bookable: false,
        })
      );
      expect(hall).toMatchObject({
        name: "Main Hall",
        sortIndex: 0,
        eventIds: [event.id],
      });
      expect(store.sortIndex).toBe(1);

      expect(value(await venue().listLocations(ADMIN, {}))).toMatchObject([
        { id: hall.id, eventIds: [event.id] },
        { id: store.id, bookable: false, eventIds: [] },
      ]);
      expect(
        value(await venue().listLocations(ADMIN, { eventId: event.id }))
      ).toMatchObject([{ id: hall.id }]);
    }
  );

  it("reports every invalid field at once", { tags: ["017-US1"] }, async () => {
    const result = await venue().createLocation(ADMIN, {
      ...room,
      name: " ",
      eventIds: ["no-such-event"],
    });
    expect(result).toEqual({
      ok: false,
      error: {
        kind: "invalid",
        code: "location.invalid",
        detail: "Name is required",
        errors: [
          { path: "name", message: "Name is required" },
          { path: "eventIds", message: "Unknown event" },
        ],
      },
    });
    expect(await getRepositories().locations.list()).toEqual([]);
  });

  it(
    "stores a valid image through the image store",
    { tags: ["017-US2"] },
    async () => {
      const image = new Blob([new Uint8Array([1, 2, 3])]);
      const created = value(
        await venue().createLocation(ADMIN, { ...room, image })
      );
      expect(created.imageUrl).toBe(`/media/locations/${created.id}.png`);
      images.validate.mockResolvedValueOnce({ error: "Wrong shape" });
      expect(
        await venue().updateLocation(ADMIN, { ...room, id: created.id, image })
      ).toMatchObject({
        ok: false,
        error: { errors: [{ path: "image", message: "Wrong shape" }] },
      });
    }
  );

  it("edits, moves and deletes a location", { tags: ["017-US1"] }, async () => {
    const first = await createLocation({ name: "A", sortIndex: 0 });
    const second = await createLocation({ name: "B", sortIndex: 1 });
    const renamed = value(
      await venue().updateLocation(ADMIN, { ...room, id: first.id })
    );
    expect(renamed).toMatchObject({ id: first.id, name: "Main Hall" });
    expect(
      code(await venue().updateLocation(ADMIN, { ...room, id: "nope" }))
    ).toBe("location.notFound");

    value(
      await venue().moveLocation(ADMIN, { id: second.id, direction: "up" })
    );
    const order = value(await venue().listLocations(ADMIN, {}));
    expect(order.map((l) => l.id)).toEqual([second.id, first.id]);

    value(await venue().deleteLocation(ADMIN, { id: first.id }));
    expect(images.delete).toHaveBeenCalledWith(first.id);
    expect(code(await venue().deleteLocation(ADMIN, { id: first.id }))).toBe(
      "location.notFound"
    );
  });

  it(
    "assigns locations to an event and removes them",
    { tags: ["017-US3"] },
    async () => {
      const event = await createEvent();
      const location = await createLocation();
      const assign = (locationIds: string[], eventId = event.id) =>
        venue().assignLocationsToEvent(ADMIN, { eventId, locationIds });

      expect(code(await assign([location.id, "nope"]))).toBe(
        "location.notFound"
      );
      expect(code(await assign([location.id], "nope"))).toBe("event.notFound");
      value(await assign([location.id, location.id]));
      expect(
        await getRepositories().locations.listLocationIdsByEvent(event.id)
      ).toEqual([location.id]);

      value(
        await venue().removeLocationsFromEvent(ADMIN, {
          eventId: event.id,
          locationIds: [location.id],
        })
      );
      expect(
        await getRepositories().locations.listLocationIdsByEvent(event.id)
      ).toEqual([]);
    }
  );
});

describe("room unavailability use cases", () => {
  it(
    "marks rooms of the event unavailable and lifts it",
    { tags: ["017-US4", "019-US3"] },
    async () => {
      const event = await createEvent();
      const room = await createLocation({ eventId: event.id });
      const elsewhere = await createLocation();
      const add = (input: {
        locationIds: string[];
        start?: Date;
        end?: Date;
      }) =>
        sessions().addLocationUnavailability(ADMIN, {
          eventId: event.id,
          start: at("10:00"),
          end: at("12:00"),
          ...input,
        });

      expect(
        code(
          await sessions().addLocationUnavailability(NOBODY, {
            eventId: event.id,
            locationIds: [room.id],
            start: at("10:00"),
            end: at("12:00"),
          })
        )
      ).toBe("admin.required");
      expect(code(await add({ locationIds: [elsewhere.id] }))).toBe(
        "unavailability.roomNotInEvent"
      );
      expect(code(await add({ locationIds: [] }))).toBe(
        "unavailability.roomRequired"
      );
      expect(
        code(await add({ locationIds: [room.id], end: at("09:00") }))
      ).toBe("unavailability.endBeforeStart");
      expect(
        code(await add({ locationIds: [room.id], start: undefined }))
      ).toBe("unavailability.timeInvalid");

      value(await add({ locationIds: [room.id, room.id] }));
      const [period] = value(
        await sessions().listLocationUnavailability(ADMIN, {
          eventId: event.id,
        })
      );
      expect(period).toMatchObject({
        locationId: room.id,
        start: at("10:00"),
        end: at("12:00"),
      });

      expect(
        value(
          await sessions().deleteLocationUnavailability(ADMIN, {
            id: period.id,
          })
        )
      ).toEqual(period);
      expect(
        code(
          await sessions().deleteLocationUnavailability(ADMIN, {
            id: period.id,
          })
        )
      ).toBe("unavailability.notFound");
    }
  );
});
