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
import { createMeetingUseCases } from "@/server/modules/meetings/module";
import { createPeopleUseCases } from "@/server/modules/people/module";
import { isoDay } from "../helpers/dates";

const NINE = new Date("2026-06-02T09:00:00.000Z");
const TEN = new Date("2026-06-02T10:00:00.000Z");

const ADMIN: Actor = { admin: true, guest: null };
const NOW = new Date();
const sessions = () =>
  createSessionUseCases({
    repos: getRepositories(),
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

const people = () =>
  createPeopleUseCases({
    repos: getRepositories(),
    avatars: {
      validate: (buffer) => Promise.resolve({ buffer, ext: "png" }),
      saveNew: (id) => Promise.resolve(`/media/avatars/${id}-1.png`),
      deleteByUrl: async () => {},
    },
    loginMail: {
      configured: () => false,
      send: async () => {},
      sendResetLink: async () => {},
      sendJoinLink: async () => {},
      sendJoinLinkMade: async () => {},
      sendSecurityChanged: async () => {},
    },
    sendTestEmail: async () => {},
    uow: unitOfWork,
  });

const meetings = () =>
  createMeetingUseCases({
    repos: getRepositories(),
    uow: unitOfWork,
  });

const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "claimed" },
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
      guest: { id: host.id, level: "claimed" },
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
        guest: { id, level: "claimed" },
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
        guest: { id: guest.id, level: "claimed" },
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
  describe("with guests", () => {
    const ok = (result: { ok: boolean }) => expect(result.ok).toBe(true);

    it("for guests joining and leaving an event", async () => {
      const w = await world();
      const newcomer = await createGuest({ name: "Nia Newcomer" });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await people().assignGuestsToEvent(
            ADMIN,
            { eventId: w.event.id, guestIds: [newcomer.id] },
            NOW
          )
        );
      });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await people().removeGuestsFromEvent(
            ADMIN,
            { eventId: w.event.id, guestIds: [newcomer.id, w.host.id] },
            NOW
          )
        );
      });
    });

    it("for guests an import or a script brings in, and a deleted guest", async () => {
      const w = await world();
      const leaving = await createGuest({ name: "Lee", eventId: w.event.id });
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(
          await people().importGuests(
            ADMIN,
            {
              csv: "name,email\nIda,ida@example.com\n",
              eventIds: [w.event.id],
            },
            NOW
          )
        );
        ok(
          await people().ensureGuest(
            ADMIN,
            {
              name: "Esme",
              email: "esme@example.com",
              eventSlug: w.event.slug,
            },
            NOW
          )
        );
        ok(await people().deleteGuest(ADMIN, { id: leaving.id }, NOW));
      });
    });

    it("for public profile edits, seen by the guest and by others", async () => {
      const w = await world();
      const friend = await createGuest({ name: "Fay", eventId: w.event.id });
      const edit = (id: string, version: number) =>
        people().updateMyProfile(
          open(id),
          {
            name: "Fay Renamed",
            aboutMe: "Hello",
            pronouns: null,
            basedIn: null,
            prompts: null,
            languages: null,
            contacts: null,
            expectedVersion: version,
          },
          NOW
        );
      await expectChangesSuffice(w.viewer, w.event.slug, async () => {
        ok(await edit(friend.id, friend.profileVersion));
      });
      await expectChangesSuffice(open(friend.id), w.event.slug, async () => {
        ok(
          await people().updateGuest(
            ADMIN,
            {
              id: friend.id,
              name: "Fay Again",
              email: "fay@example.com",
              expectedVersion: (await getRepositories().guests.findById(
                friend.id
              ))!.version,
            },
            NOW
          )
        );
      });
    });
  });

  describe("with meetings", () => {
    const ok = (result: { ok: boolean }) => expect(result.ok).toBe(true);
    const DAY = isoDay(30);
    const SLOT = `${DAY}T10:00:00.000Z`;
    const SLOT_2 = `${DAY}T10:30:00.000Z`;

    async function meetingWorld() {
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
      const bystander = await createGuest({ name: "Bo", eventId: event.id });
      await repos.meetingAvailability.replaceForGuest(grace.id, event.id, [
        new Date(SLOT),
        new Date(SLOT_2),
      ]);
      return { event, ada, grace, bystander };
    }

    it("for a 1-on-1 asked, answered and called off, per party", async () => {
      const w = await meetingWorld();
      let meetingId = "";
      const watchers = [open(w.ada.id), open(w.grace.id), open(w.bystander.id)];
      const watch = async (work: () => Promise<unknown>) => {
        const run = watchers.reduceRight(
          (inner, viewer) => () =>
            expectChangesSuffice(viewer, w.event.slug, inner),
          work
        );
        await run();
      };
      await watch(async () => {
        const result = await meetings().requestMeeting(
          open(w.ada.id),
          {
            eventId: w.event.id,
            recipientId: w.grace.id,
            slotStart: SLOT,
            slotCount: 1,
            meetingPoint: "Coffee bar",
          },
          NOW
        );
        ok(result);
        if (result.ok) meetingId = result.value.id;
      });
      await watch(async () => {
        ok(
          await meetings().respondToMeeting(
            open(w.grace.id),
            { meetingId, response: "accept" },
            NOW
          )
        );
      });
      await watch(async () => {
        ok(
          await meetings().cancelMeeting(
            open(w.ada.id),
            { meetingId, note: "Sorry" },
            NOW
          )
        );
      });
    });

    it("for a deleted guest's hosting, RSVPs and 1-on-1s", async () => {
      const w = await meetingWorld();
      const hosted = await createSession(w.event.id, {
        title: "Grace's talk",
        hostIds: [w.grace.id],
        startTime: new Date(`${DAY}T12:00:00.000Z`),
        endTime: new Date(`${DAY}T13:00:00.000Z`),
      });
      const adas = await createSession(w.event.id, {
        title: "Ada's talk",
        hostIds: [w.ada.id],
        startTime: new Date(`${DAY}T14:00:00.000Z`),
        endTime: new Date(`${DAY}T15:00:00.000Z`),
      });
      ok(
        await sessions().rsvp(
          open(w.grace.id),
          { sessionId: adas.id, guestId: w.grace.id },
          NOW
        )
      );
      ok(
        await sessions().rsvp(
          open(w.ada.id),
          { sessionId: hosted.id, guestId: w.ada.id },
          NOW
        )
      );
      ok(
        await meetings().requestMeeting(
          open(w.ada.id),
          {
            eventId: w.event.id,
            recipientId: w.grace.id,
            slotStart: SLOT,
            slotCount: 1,
            meetingPoint: "Lawn",
          },
          NOW
        )
      );
      await expectChangesSuffice(open(w.ada.id), w.event.slug, () =>
        expectChangesSuffice(open(w.bystander.id), w.event.slug, async () => {
          ok(await people().deleteGuest(ADMIN, { id: w.grace.id }, NOW));
        })
      );
    });

    it("for a host who is not a member, as a session comes and goes", async () => {
      const w = await meetingWorld();
      const outsider = await createGuest({ name: "Otto Outsider" });
      let id = "";
      await expectChangesSuffice(open(w.ada.id), w.event.slug, async () => {
        const result = await sessions().adminCreateSession(
          ADMIN,
          {
            eventId: w.event.id,
            title: "Guest talk",
            description: "",
            startTime: `${DAY}T12:00:00.000Z`,
            endTime: `${DAY}T13:00:00.000Z`,
            capacity: 10,
            blocker: false,
            hostIds: [outsider.id],
            locationIds: [],
            adminManaged: false,
            closed: false,
          },
          NOW
        );
        ok(result);
        if (result.ok) id = result.value.id;
      });
      await expectChangesSuffice(open(w.ada.id), w.event.slug, async () => {
        ok(await sessions().adminDeleteSession(ADMIN, { id }, NOW));
      });
    });

    it("for the slots a guest declares free", async () => {
      const w = await meetingWorld();
      await expectChangesSuffice(open(w.grace.id), w.event.slug, async () => {
        ok(
          await meetings().saveMeetingAvailability(
            open(w.grace.id),
            { eventId: w.event.id, slotStarts: [SLOT_2] },
            NOW
          )
        );
      });
    });

    it("for meeting points added, renamed and removed", async () => {
      const w = await meetingWorld();
      let point: { id: string; version: number } | undefined;
      await expectChangesSuffice(open(w.ada.id), w.event.slug, async () => {
        const result = await meetings().createMeetingPoint(
          ADMIN,
          { eventId: w.event.id, name: "Lawn" },
          NOW
        );
        ok(result);
        if (result.ok) point = result.value;
      });
      await expectChangesSuffice(open(w.ada.id), w.event.slug, async () => {
        ok(
          await meetings().updateMeetingPoint(
            ADMIN,
            {
              eventId: w.event.id,
              id: point!.id,
              name: "Lawn 2",
              expectedVersion: point!.version,
            },
            NOW
          )
        );
      });
      await expectChangesSuffice(open(w.ada.id), w.event.slug, async () => {
        ok(
          await meetings().deleteMeetingPoint(
            ADMIN,
            { eventId: w.event.id, id: point!.id },
            NOW
          )
        );
      });
    });
  });
});
