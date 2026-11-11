// @module-tag 012-US7
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
  guest: { id, level: "claimed" },
});
const SLOT = `${isoDay(30)}T10:00:00.000Z`;

async function scenario(eventPatch: Record<string, unknown> = {}) {
  const repos = getRepositories();
  const event = await createEvent({ phase: "scheduling" });
  await repos.events.update(event.id, {
    meetingsEnabled: true,
    maxOpenMeetingRequests: 1,
    ...eventPatch,
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
  return { event, ada, grace };
}

const ask = (askerId: string, eventId: string, recipientId: string) =>
  meetingUseCases().askToOpenUp(
    open(askerId),
    { eventId, recipientId },
    new Date()
  );

const notices = (guestId: string) =>
  getRepositories().notifications.listByGuest(guestId);

const recipients = () =>
  vi
    .mocked(sendMail)
    .mock.calls.map(([m]) => m.to)
    .sort();

const nudgeStates = async (viewerId: string, guestId: string) => {
  const result = await meetingUseCases().listMeetingOptions(
    open(viewerId),
    { guestId },
    new Date()
  );
  if (!result.ok) throw new Error(result.error.code);
  return result.value.nudges;
};

describe("asking someone to open up to 1-on-1s", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it("tells the recipient, in the app and by email, once", async () => {
    const { event, ada, grace } = await scenario();

    const asked = await ask(ada.id, event.id, grace.id);
    expect(asked.ok).toBe(true);
    await runJobs();
    await runJobs();

    const [notice] = await notices(grace.id);
    expect(notice.text).toBe(
      `Ada would like to book a 1-on-1 with you at ${event.name}`
    );
    expect(notice.url).toBe("/settings#one-on-ones");
    expect(recipients()).toEqual(["grace@test.example"]);
  });

  it("refuses a second nudge for the same person at the same event", async () => {
    const { event, ada, grace } = await scenario();
    await ask(ada.id, event.id, grace.id);

    const again = await ask(ada.id, event.id, grace.id);
    await runJobs();

    expect(!again.ok && again.error.code).toBe("meeting.alreadyAsked");
    expect(await notices(grace.id)).toHaveLength(1);
  });

  it("refuses when they are already open, off, or not at the event", async () => {
    const { event, ada, grace } = await scenario();
    const repos = getRepositories();
    const stranger = await createGuest({ name: "Zed" });

    const notThere = await ask(ada.id, event.id, stranger.id);
    expect(!notThere.ok && notThere.error.code).toBe(
      "meeting.recipientNotInEvent"
    );

    const self = await ask(ada.id, event.id, ada.id);
    expect(!self.ok && self.error.code).toBe("meeting.self");

    await repos.meetingAvailability.replaceForGuest(grace.id, event.id, [
      new Date(SLOT),
    ]);
    const isOpen = await ask(ada.id, event.id, grace.id);
    expect(!isOpen.ok && isOpen.error.code).toBe("meeting.alreadyOpen");

    await repos.events.update(event.id, { meetingsEnabled: false });
    const off = await ask(ada.id, event.id, grace.id);
    expect(!off.ok && off.error.code).toBe("event.meetingsDisabled");
    expect(await notices(grace.id)).toHaveLength(0);
  });

  it("does not use up the asker's open-request cap", async () => {
    const { event, ada, grace } = await scenario();
    const repos = getRepositories();
    const yuki = await createGuest({ name: "Yuki", eventId: event.id });
    await repos.meetingAvailability.replaceForGuest(yuki.id, event.id, [
      new Date(SLOT),
    ]);
    await ask(ada.id, event.id, grace.id);

    const requested = await meetingUseCases().requestMeeting(
      open(ada.id),
      {
        eventId: event.id,
        recipientId: yuki.id,
        slotStart: SLOT,
        slotCount: 1,
        meetingPoint: "Coffee bar",
      },
      new Date()
    );

    expect(requested.ok).toBe(true);
  });

  it("shows the profile whether the viewer can ask or already has", async () => {
    const { event, ada, grace } = await scenario();
    const states = () => nudgeStates(ada.id, grace.id);

    expect(await states()).toEqual([
      { eventId: event.id, eventName: event.name, state: "canAsk" },
    ]);
    await ask(ada.id, event.id, grace.id);
    expect(await states()).toEqual([
      { eventId: event.id, eventName: event.name, state: "asked" },
    ]);
    await getRepositories().meetingAvailability.replaceForGuest(
      grace.id,
      event.id,
      [new Date(SLOT)]
    );
    expect(await states()).toEqual([]);
  });

  it("treats someone whose slots are all past as not open", async () => {
    const { event, ada, grace } = await scenario();
    await getRepositories().meetingAvailability.replaceForGuest(
      grace.id,
      event.id,
      [new Date(`${isoDay(-5)}T10:00:00.000Z`)]
    );

    const asked = await ask(ada.id, event.id, grace.id);

    expect(asked.ok).toBe(true);
  });

  it("offers nothing where 1-on-1s are off", async () => {
    const { event, ada, grace } = await scenario();
    await getRepositories().events.update(event.id, {
      meetingsEnabled: false,
    });

    expect(await nudgeStates(ada.id, grace.id)).toEqual([]);
  });

  it("tells each asker once when the recipient opens up", async () => {
    const { event, ada, grace } = await scenario();
    const lin = await createGuest({
      name: "Lin",
      email: "lin@test.example",
      eventId: event.id,
    });
    const quiet = await createGuest({ name: "Quiet", eventId: event.id });
    await ask(ada.id, event.id, grace.id);
    await ask(lin.id, event.id, grace.id);
    await ask(quiet.id, event.id, ada.id);
    await runJobs();
    vi.mocked(sendMail).mockReset();

    const save = (slots: string[]) =>
      meetingUseCases().saveMeetingAvailability(
        open(grace.id),
        { eventId: event.id, slotStarts: slots },
        new Date()
      );
    await save([SLOT]);
    await runJobs();
    await save([]);
    await save([SLOT, `${isoDay(30)}T10:30:00.000Z`]);
    await runJobs();

    expect(recipients()).toEqual(["ada@test.example", "lin@test.example"]);
    const [notice] = await notices(ada.id);
    expect(notice.text).toBe(`Grace is open to 1-on-1s at ${event.name}`);
    expect(notice.url).toBe(`/guests/${grace.id}`);
    expect(await notices(quiet.id)).toHaveLength(0);
  });
});
