// @module-tag 013-US4
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import { createEvent, createGuest } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { sessionUseCases } from "@/server/composition";
import { recordCohostsAdded } from "@/server/modules/sessions/module";
import type { Actor } from "@/server/kernel/actor";
import type { Tx } from "@/server/kernel/unit-of-work";
import type { Session } from "@schellingboard/domain/session";

const ADMIN: Actor = { admin: true, guest: null };
const AT = new Date("2026-06-01T10:00:00.000Z");

const fields = {
  title: "Lunch",
  description: "",
  startTime: "2030-01-01T12:00:00.000Z",
  endTime: "2030-01-01T13:00:00.000Z",
  capacity: 0,
  adminManaged: false,
  blocker: false,
  closed: false,
  locationIds: [],
};

const recipients = () =>
  vi
    .mocked(sendMail)
    .mock.calls.map(([m]) => m.to)
    .sort();

describe("co-host notifications from the change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it(
    "tells hosts added to a new or edited session once, however often the jobs run",
    { tags: ["013-US4"] },
    async () => {
      const event = await createEvent();
      const first = await createGuest({
        email: "first@test.example",
        eventId: event.id,
      });
      const second = await createGuest({
        email: "second@test.example",
        eventId: event.id,
      });
      const sessions = sessionUseCases();

      const created = await sessions.adminCreateSession(
        ADMIN,
        { ...fields, eventId: event.id, hostIds: [first.id] },
        AT
      );
      if (!created.ok) throw new Error(created.error.code);
      expect(
        (await getRepositories().changes.listAfter(0)).map((c) => c.type)
      ).toContain("session.cohostsAdded");
      await runJobs();
      await runJobs();
      expect(recipients()).toEqual(["first@test.example"]);

      vi.mocked(sendMail).mockReset();
      const updated = await sessions.adminUpdateSession(
        ADMIN,
        {
          ...fields,
          id: created.value.id,
          expectedVersion: created.value.version,
          hostIds: [first.id, second.id],
        },
        AT
      );
      expect(updated.ok).toBe(true);
      await runJobs();
      await runJobs();
      expect(recipients()).toEqual(["second@test.example"]);
    }
  );

  it("sends no co-host notice for a session deleted before the jobs ran", async () => {
    const event = await createEvent();
    const host = await createGuest({
      email: "host@test.example",
      eventId: event.id,
    });
    const sessions = sessionUseCases();
    const created = await sessions.adminCreateSession(
      ADMIN,
      { ...fields, eventId: event.id, hostIds: [host.id] },
      AT
    );
    if (!created.ok) throw new Error(created.error.code);
    await sessions.adminDeleteSession(ADMIN, { id: created.value.id }, AT);

    await runJobs();

    const notices = await getRepositories().notifications.listByGuest(host.id);
    expect(notices.map((n) => n.text).join("\n")).not.toContain("co-host");
  });

  it("does not record the acting guest or earlier hosts as added", () => {
    const record = vi.fn();
    const session = {
      id: "s",
      eventId: "e",
      hosts: [{ id: "old" }, { id: "me" }, { id: "new" }],
    } as Session;

    recordCohostsAdded({ record } as unknown as Tx, session, ["old"], {
      actor: { type: "guest", id: "me" },
      at: AT,
    });

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { hostIds: ["new"] } })
    );
  });
});
