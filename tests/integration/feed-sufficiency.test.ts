// @module-tag 007-US8
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { deleteLoggedSession, updateLoggedSession } from "../helpers/changes";
import {
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { expectChangesSuffice } from "../helpers/sufficiency";
import { getRepositories } from "@/db/container";
import type { Actor } from "@/server/kernel/actor";
import { unitOfWork } from "@/server/kernel/unit-of-work";
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
});
