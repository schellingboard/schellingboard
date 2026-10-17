// @module-tag 007-US8
import { describe, it, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { deleteLoggedSession, updateLoggedSession } from "../helpers/changes";
import {
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { expectChangesSuffice } from "../helpers/sufficiency";
import type { Actor } from "@/server/kernel/actor";

const NINE = new Date("2026-06-02T09:00:00.000Z");
const TEN = new Date("2026-06-02T10:00:00.000Z");

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
});
