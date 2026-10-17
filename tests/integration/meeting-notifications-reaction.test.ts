// @module-tag 012-US3
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { sendMail } from "@/utils/mailer";
import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import { createDay, createEvent, createGuest } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { meetingUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";

const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const SLOT = `${isoDay(30)}T10:00:00.000Z`;

const recipients = () =>
  vi
    .mocked(sendMail)
    .mock.calls.map(([m]) => m.to)
    .sort();

async function scenario() {
  const repos = getRepositories();
  const event = await createEvent({ phase: "scheduling" });
  await repos.events.update(event.id, {
    meetingsEnabled: true,
    maxOpenMeetingRequests: 5,
  });
  await createDay(event.id, {
    start: new Date(`${isoDay(30)}T09:00:00.000Z`),
    end: new Date(`${isoDay(30)}T17:00:00.000Z`),
  });
  const ada = await createGuest({
    name: "Ada",
    email: "ada@test.example",
    eventId: event.id,
  });
  const grace = await createGuest({
    name: "Grace",
    email: "grace@test.example",
    eventId: event.id,
  });
  await repos.meetingAvailability.replaceForGuest(grace.id, event.id, [
    new Date(SLOT),
  ]);
  const asked = await meetingUseCases().requestMeeting(
    open(ada.id),
    {
      eventId: event.id,
      recipientId: grace.id,
      slotStart: SLOT,
      slotCount: 1,
      meetingPoint: "Coffee bar",
      message: "Hi",
    },
    new Date()
  );
  if (!asked.ok) throw new Error(asked.error.code);
  return { ada, grace, meeting: asked.value };
}

const types = async () =>
  (await getRepositories().changes.listAfter(0)).map((c) => c.type);

describe("1-on-1 notifications from the change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it(
    "tells the recipient of a request once, however often the jobs run",
    { tags: ["012-US3"] },
    async () => {
      await scenario();
      expect(await types()).toContain("meeting.requested");

      await runJobs();
      await runJobs();

      expect(recipients()).toEqual(["grace@test.example"]);
    }
  );

  it(
    "tells the requester of an answer once",
    { tags: ["012-US4"] },
    async () => {
      const { grace, meeting } = await scenario();
      await runJobs();
      vi.mocked(sendMail).mockReset();

      await meetingUseCases().respondToMeeting(
        open(grace.id),
        { meetingId: meeting.id, response: "accept" },
        new Date()
      );
      expect(await types()).toContain("meeting.answered");
      await runJobs();
      await runJobs();
      expect(recipients()).toEqual(["ada@test.example"]);
    }
  );

  it("tells the other party of a cancellation once", async () => {
    const { ada, grace, meeting } = await scenario();
    await meetingUseCases().respondToMeeting(
      open(grace.id),
      { meetingId: meeting.id, response: "accept" },
      new Date()
    );
    await runJobs();
    vi.mocked(sendMail).mockReset();

    await meetingUseCases().cancelMeeting(
      open(ada.id),
      { meetingId: meeting.id },
      new Date()
    );
    await runJobs();
    await runJobs();
    expect(recipients()).toEqual(["grace@test.example"]);
  });

  it("sends nothing when the recipient is deleted before the jobs ran", async () => {
    const { grace } = await scenario();
    await getRepositories().guests.delete(grace.id);

    await runJobs();

    expect(recipients()).toEqual([]);
  });

  it("sends one notice, not two, when a request is taken back before the jobs ran", async () => {
    const { ada, meeting } = await scenario();
    await meetingUseCases().cancelMeeting(
      open(ada.id),
      { meetingId: meeting.id },
      new Date()
    );

    await runJobs();

    expect(recipients()).toEqual(["grace@test.example"]);
  });
});
