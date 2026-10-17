// @module-tag 007-US8
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { deleteLoggedSession, updateLoggedSession } from "../helpers/changes";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
  createUnavailability,
} from "../helpers/factories";
import { expectChangesSuffice } from "../helpers/sufficiency";
import { getRepositories } from "@/db/container";
import type { Actor } from "@/server/kernel/actor";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createVenueUseCases } from "@/server/modules/venue/module";
import { createEventUseCases } from "@/server/modules/events/module";
import { createSessionUseCases } from "@/server/modules/sessions/module";

const NINE = new Date("2026-06-02T09:00:00.000Z");
const TEN = new Date("2026-06-02T10:00:00.000Z");

const ADMIN: Actor = { admin: true, guest: null };
const NOW = new Date();
const sessions = () =>
  createSessionUseCases({
    repos: getRepositories(),
    notifyCohostsAdded: async () => {},
    uow: unitOfWork,
  });

const events = () =>
  createEventUseCases({ repos: getRepositories(), uow: unitOfWork });

const venue = () =>
  createVenueUseCases({
    repos: getRepositories(),
    images: {
      validate: (buffer) => Promise.resolve({ buffer, ext: "png" }),
      saveNew: (id) => Promise.resolve(`/media/locations/${id}-1.png`),
      deleteByUrl: async () => {},
    },
    uow: unitOfWork,
  });

describe("the logged changes suffice to keep a replica current", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  async function world() {
    const event = await createEvent();
    const other = await createEvent();
    const host = await createGuest({ name: "Hana Host", eventId: event.id });
    const room = await createLocation({ name: "Room A", eventId: event.id });
    const hall = await createLocation({ name: "Hall", eventId: event.id });
    const session = await createSession(event.id, {
      title: "Talk",
      hostIds: [host.id],
      locationIds: [room.id],
      startTime: NINE,
      endTime: TEN,
    });
    const elsewhere = await createSession(other.id, { title: "Other" });
    const viewer: Actor = {
      admin: false,
      guest: { id: host.id, level: "open" },
    };
    return { event, host, room, hall, session, elsewhere, viewer };
  }

  it("for a session edit", async () => {
    const w = await world();
    await expectChangesSuffice(w.viewer, w.event.slug, async () => {
      await updateLoggedSession(w.session.id, {
        title: "Renamed",
        locationIds: [w.hall.id],
      });
      await updateLoggedSession(w.elsewhere.id, { title: "Not here" });
    });
  });

  it("for a session deletion", async () => {
    const w = await world();
    await expectChangesSuffice(w.viewer, w.event.slug, () =>
      deleteLoggedSession(w.session.id)
    );
  });

  it("for a session created by an organizer", async () => {
    const w = await world();
    await expectChangesSuffice(w.viewer, w.event.slug, async () => {
      const created = await sessions().adminCreateSession(
        ADMIN,
        {
          eventId: w.event.id,
          title: "Fresh",
          description: "",
          startTime: "2026-06-02T11:00:00.000Z",
          endTime: "2026-06-02T12:00:00.000Z",
          capacity: 10,
          adminManaged: false,
          blocker: false,
          closed: false,
          hostIds: [w.host.id],
          locationIds: [w.hall.id],
        },
        NOW
      );
      expect(created.ok).toBe(true);
    });
  });

  it("for a session seeded by a script", async () => {
    const w = await world();
    await expectChangesSuffice(w.viewer, w.event.slug, async () => {
      const seeded = await sessions().adminSeedSession(
        ADMIN,
        {
          eventSlug: w.event.slug,
          title: "Seeded",
          description: "",
          startTime: TEN,
          endTime: new Date("2026-06-02T11:00:00.000Z"),
          hostIds: [],
          locationIds: [w.hall.id],
          adminManaged: false,
          closed: false,
        },
        NOW
      );
      expect(seeded.ok).toBe(true);
    });
  });

  describe("with RSVPs", () => {
    async function rsvpWorld() {
      const w = await world();
      const scheduling = await createEvent({ phase: "scheduling" });
      const guest = await createGuest({ eventId: scheduling.id });
      const watcher = await createGuest({ eventId: scheduling.id });
      const talk = await createSession(scheduling.id, {
        title: "Open talk",
        startTime: NINE,
        endTime: TEN,
      });
      const actor = (id: string): Actor => ({
        admin: false,
        guest: { id, level: "open" },
      });
      return { ...w, scheduling, talk, guest, watcher, actor };
    }

    it("for the RSVPer, who learns of their RSVP and the count", async () => {
      const w = await rsvpWorld();
      await expectChangesSuffice(
        w.actor(w.guest.id),
        w.scheduling.slug,
        async () => {
          const result = await sessions().rsvp(
            w.actor(w.guest.id),
            { sessionId: w.talk.id, guestId: w.guest.id },
            NOW
          );
          expect(result.ok).toBe(true);
        }
      );
    });

    it("for another attendee, who learns only the count", async () => {
      const w = await rsvpWorld();
      await expectChangesSuffice(
        w.actor(w.watcher.id),
        w.scheduling.slug,
        async () => {
          await sessions().rsvp(
            w.actor(w.guest.id),
            { sessionId: w.talk.id, guestId: w.guest.id },
            NOW
          );
        }
      );
    });

    it("for a withdrawn RSVP", async () => {
      const w = await rsvpWorld();
      await getRepositories().rsvps.create({
        sessionId: w.talk.id,
        guestId: w.guest.id,
      });
      await expectChangesSuffice(
        w.actor(w.guest.id),
        w.scheduling.slug,
        async () => {
          const result = await sessions().withdrawRsvp(
            w.actor(w.guest.id),
            { sessionId: w.talk.id, guestId: w.guest.id },
            NOW
          );
          expect(result.ok).toBe(true);
        }
      );
    });

    it("for RSVPs added and removed by an organizer", async () => {
      const w = await rsvpWorld();
      const input = { sessionId: w.talk.id, guestId: w.guest.id };
      await expectChangesSuffice(w.actor(w.guest.id), w.scheduling.slug, () =>
        sessions().adminAddRsvp(ADMIN, input, NOW)
      );
      await expectChangesSuffice(w.actor(w.guest.id), w.scheduling.slug, () =>
        sessions().adminRemoveRsvp(ADMIN, input, NOW)
      );
    });

    it("for a session deleted with an RSVP to it", async () => {
      const w = await rsvpWorld();
      await getRepositories().rsvps.create({
        sessionId: w.talk.id,
        guestId: w.guest.id,
      });
      await expectChangesSuffice(w.actor(w.guest.id), w.scheduling.slug, () =>
        deleteLoggedSession(w.talk.id)
      );
    });
  });

  describe("with events and days", () => {
    async function dayWorld() {
      const scheduling = await createEvent({ phase: "scheduling" });
      const guest = await createGuest({ eventId: scheduling.id });
      const day = await createDay(scheduling.id, {
        start: new Date("2026-06-02T08:00:00.000Z"),
        end: new Date("2026-06-02T18:00:00.000Z"),
        startBookings: new Date("2026-06-02T09:00:00.000Z"),
        endBookings: new Date("2026-06-02T17:00:00.000Z"),
      });
      const talk = await createSession(scheduling.id, {
        title: "On the day",
        startTime: NINE,
        endTime: TEN,
      });
      await getRepositories().rsvps.create({
        sessionId: talk.id,
        guestId: guest.id,
      });
      const viewer: Actor = {
        admin: false,
        guest: { id: guest.id, level: "open" },
      };
      return { scheduling, guest, day, talk, viewer };
    }

    const settingsOf = (e: Awaited<ReturnType<typeof createEvent>>) => ({
      name: e.name,
      description: e.description,
      website: e.website,
      timezone: e.timezone,
      maxSessionDuration: e.maxSessionDuration,
      breakMinutes: e.breakMinutes,
      slotIncrementMinutes: e.slotIncrementMinutes,
    });

    it("for event settings", async () => {
      const w = await dayWorld();
      await expectChangesSuffice(w.viewer, w.scheduling.slug, async () => {
        const result = await events().updateEvent(
          ADMIN,
          {
            ...settingsOf(w.scheduling),
            name: "Renamed event",
            id: w.scheduling.id,
            expectedVersion: w.scheduling.version,
          },
          NOW
        );
        expect(result.ok).toBe(true);
      });
    });

    it("for event phases", async () => {
      const w = await dayWorld();
      await expectChangesSuffice(w.viewer, w.scheduling.slug, async () => {
        const result = await events().updateEventPhases(
          ADMIN,
          {
            id: w.scheduling.id,
            expectedVersion: w.scheduling.version,
            proposalPhaseStart: undefined,
            proposalPhaseEnd: undefined,
            votingPhaseStart: undefined,
            votingPhaseEnd: undefined,
            schedulingPhaseStart: w.scheduling.schedulingPhaseStart,
            schedulingPhaseEnd: undefined,
          },
          NOW
        );
        expect(result.ok).toBe(true);
      });
    });

    it("for a day added, moved and deleted, with the event's dates", async () => {
      const w = await dayWorld();
      const window = (hour: number) => ({
        start: new Date(`2026-06-03T0${hour}:00:00.000Z`),
        end: new Date(`2026-06-03T1${hour}:00:00.000Z`),
        startBookings: new Date(`2026-06-03T0${hour + 1}:00:00.000Z`),
        endBookings: new Date(`2026-06-03T1${hour - 1}:00:00.000Z`),
      });
      let added: { id: string; version: number } | undefined;
      await expectChangesSuffice(w.viewer, w.scheduling.slug, async () => {
        const result = await events().createDay(
          ADMIN,
          { ...window(8), eventId: w.scheduling.id },
          NOW
        );
        expect(result.ok).toBe(true);
        if (result.ok) added = result.value;
      });
      await expectChangesSuffice(w.viewer, w.scheduling.slug, async () => {
        const result = await events().updateDay(
          ADMIN,
          { ...window(7), id: added!.id, expectedVersion: added!.version },
          NOW
        );
        expect(result.ok).toBe(true);
      });
      await expectChangesSuffice(w.viewer, w.scheduling.slug, async () => {
        const result = await events().deleteDay(ADMIN, { id: added!.id }, NOW);
        expect(result.ok).toBe(true);
      });
    });

    it("for a day deleted with a session and its RSVP on it", async () => {
      const w = await dayWorld();
      await expectChangesSuffice(w.viewer, w.scheduling.slug, async () => {
        const result = await events().deleteDay(ADMIN, { id: w.day.id }, NOW);
        expect(result.ok).toBe(true);
      });
    });
  });

  describe("with locations", () => {
    async function venueWorld() {
      const w = await world();
      const period = await createUnavailability(
        w.event.id,
        w.room.id,
        NINE,
        TEN
      );
      const elsewhere = await createEvent();
      return { ...w, period, elsewhere };
    }
    const ok = (result: { ok: boolean }) => expect(result.ok).toBe(true);

    it("for a location created, edited and moved to another event", async () => {
      const w = await venueWorld();
      let made: { id: string; version: number } | undefined;
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        const result = await venue().createLocation(
          ADMIN,
          { name: "Annex", capacity: 8, eventIds: [w.event.id] },
          NOW
        );
        ok(result);
        if (result.ok) made = result.value;
      });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await venue().updateLocation(
            ADMIN,
            {
              id: made!.id,
              name: "Annex 2",
              capacity: 9,
              eventIds: [w.event.id, w.elsewhere.id],
              expectedVersion: made!.version,
            },
            NOW
          )
        );
      });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await venue().updateLocation(
            ADMIN,
            {
              id: made!.id,
              name: "Annex 2",
              capacity: 9,
              eventIds: [w.elsewhere.id],
              expectedVersion: (await getRepositories().locations.findById(
                made!.id
              ))!.version,
            },
            NOW
          )
        );
      });
    });

    it("for a location's image and its place in the order", async () => {
      const w = await venueWorld();
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await venue().moveLocation(
            ADMIN,
            { id: w.hall.id, direction: "up", expectedVersion: w.hall.version },
            NOW
          )
        );
      });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await venue().replaceLocationImage(
            ADMIN,
            {
              id: w.room.id,
              image: Buffer.from("x"),
              expectedVersion: (await getRepositories().locations.findById(
                w.room.id
              ))!.version,
            },
            NOW
          )
        );
      });
    });

    it("for locations assigned to and removed from the event", async () => {
      const w = await venueWorld();
      const spare = await createLocation({ name: "Spare" });
      const input = { eventId: w.event.id, locationIds: [spare.id] };
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(await venue().assignLocationsToEvent(ADMIN, input, NOW));
      });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await venue().removeLocationsFromEvent(
            ADMIN,
            { eventId: w.event.id, locationIds: [spare.id, w.room.id] },
            NOW
          )
        );
      });
    });

    it("for a location deleted from under a session and a closed period", async () => {
      const w = await venueWorld();
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(await venue().deleteLocation(ADMIN, { id: w.room.id }, NOW));
      });
    });

    it("for a room made unavailable, then available again", async () => {
      const w = await venueWorld();
      let added: { id: string }[] = [];
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        const result = await sessions().addLocationUnavailability(
          ADMIN,
          {
            eventId: w.event.id,
            locationIds: [w.hall.id, w.room.id],
            start: new Date("2026-06-02T12:00:00.000Z"),
            end: new Date("2026-06-02T13:00:00.000Z"),
          },
          NOW
        );
        ok(result);
        if (result.ok) added = result.value;
      });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await sessions().deleteLocationUnavailability(
            ADMIN,
            { id: added[0].id },
            NOW
          )
        );
        ok(
          await sessions().deleteLocationUnavailability(
            ADMIN,
            { id: w.period.id },
            NOW
          )
        );
      });
    });

    it("for a location a seeded session brings into the event", async () => {
      const w = await venueWorld();
      const annex = await createLocation({ name: "Annex" });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await sessions().adminSeedSession(
            ADMIN,
            {
              eventSlug: w.event.slug,
              title: "In the annex",
              description: "",
              startTime: TEN,
              endTime: new Date("2026-06-02T11:00:00.000Z"),
              hostIds: [],
              locationIds: [annex.id],
              adminManaged: false,
              closed: false,
            },
            NOW
          )
        );
      });
    });
  });
});
