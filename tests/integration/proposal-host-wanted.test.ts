// @module-tag 004-US6
// @module-tag 004-US7
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

const { afterTasks } = vi.hoisted(() => ({
  afterTasks: [] as Promise<unknown>[],
}));

vi.mock("next/server", () => ({
  after: (task: () => unknown) => {
    afterTasks.push(Promise.resolve(task()));
  },
}));

const cookieJar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => {
        const value = cookieJar.get(name);
        return value === undefined ? undefined : { name, value };
      },
    }),
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import { siteAuthenticate } from "../helpers/site-auth";
import {
  createEvent,
  createGuest,
  createProposal as createProposalFixture,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import {
  createProposal,
  joinProposal,
  updateProposal,
} from "@/app/(site)/[eventSlug]/proposals/actions";
import { VoteChoice } from "@schellingboard/domain/vote";
import { sendMail } from "@/utils/mailer";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function actAs(guestId: string): void {
  cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guestId));
}

async function findProposal(id: string) {
  return (await getRepositories().sessionProposals.findById(id))!;
}

describe("a proposal that wants a host", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    afterTasks.length = 0;
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });
  afterEach(() => vi.unstubAllEnvs());

  describe("asking for a co-host", () => {
    it("stores the mark and its note on a new proposal", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      actAs(host.id);

      const result = await createProposal({
        eventId: event.id,
        eventSlug: "test-event",
        title: "Needs help",
        hostIds: [host.id],
        cohostWanted: true,
        cohostWantedNote: "  Someone who knows Rust  ",
      });
      expect(result).toEqual({ success: true });

      const [proposal] = await getRepositories().sessionProposals.listByEvent(
        event.id
      );
      expect(proposal).toMatchObject({
        cohostWanted: true,
        cohostWantedNote: "Someone who knows Rust",
      });
    });

    it("is off unless asked for", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });

      const proposal = await createProposalFixture(event.id, [host.id]);

      expect(proposal.cohostWanted).toBe(false);
      expect(proposal.cohostWantedNote).toBeUndefined();
    });

    it("sets and withdraws the mark on an existing proposal", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id]);
      actAs(host.id);

      await updateProposal(proposal.id, {
        eventSlug: "test-event",
        title: proposal.title,
        hostIds: [host.id],
        cohostWanted: true,
        cohostWantedNote: "A facilitator",
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
      });
      expect(await findProposal(proposal.id)).toMatchObject({
        cohostWanted: true,
        cohostWantedNote: "A facilitator",
      });

      await updateProposal(proposal.id, {
        eventSlug: "test-event",
        title: proposal.title,
        hostIds: [host.id],
        cohostWanted: false,
        cohostWantedNote: "A facilitator",
        expectedUpdatedTime: (
          await findProposal(proposal.id)
        ).updatedTime.toISOString(),
      });
      const after = await findProposal(proposal.id);
      expect(after.cohostWanted).toBe(false);
      expect(after.cohostWantedNote).toBeUndefined();
    });

    it("drops the mark when the last host leaves, so a later host starts without it", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        cohostWanted: true,
        cohostWantedNote: "A facilitator",
      });
      actAs(host.id);

      await updateProposal(proposal.id, {
        eventSlug: "test-event",
        title: proposal.title,
        hostIds: [],
        cohostWanted: true,
        cohostWantedNote: "A facilitator",
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
      });

      const after = await findProposal(proposal.id);
      expect(after.cohostWanted).toBe(false);
      expect(after.cohostWantedNote).toBeUndefined();
    });

    it("drops the mark when the last host's account is deleted, so a later host starts without it", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const next = await createGuest({ name: "Next", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        cohostWanted: true,
        cohostWantedNote: "A facilitator",
      });
      const { guests, sessionProposals } = getRepositories();

      await guests.delete(host.id);
      const hostless = await findProposal(proposal.id);
      expect(hostless.cohostWanted).toBe(false);
      expect(hostless.cohostWantedNote).toBeUndefined();

      await sessionProposals.update(proposal.id, {
        hostIds: [next.id],
        updatedTime: new Date(),
      });
      const after = await findProposal(proposal.id);
      expect(after.cohostWanted).toBe(false);
      expect(after.cohostWantedNote).toBeUndefined();
    });

    it("rejects a note longer than the form allows", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      actAs(host.id);

      const result = await createProposal({
        eventId: event.id,
        eventSlug: "test-event",
        title: "Needs help",
        hostIds: [host.id],
        cohostWanted: true,
        cohostWantedNote: "x".repeat(201),
      });

      expect(result).toHaveProperty("error");
    });
  });

  describe("joining", () => {
    it("makes the volunteer the host of a proposal nobody hosts", async () => {
      const event = await createEvent();
      const volunteer = await createGuest({ name: "Vol", eventId: event.id });
      const proposal = await createProposalFixture(event.id, []);
      actAs(volunteer.id);

      const result = await joinProposal(proposal.id, "test-event");
      expect(result).toEqual({ success: true });

      const after = await findProposal(proposal.id);
      expect(after.hosts.map((h) => h.id)).toEqual([volunteer.id]);
    });

    it("adds a co-host to a marked proposal and removes the mark", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const volunteer = await createGuest({ name: "Vol", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        cohostWanted: true,
        cohostWantedNote: "A facilitator",
      });
      actAs(volunteer.id);

      const result = await joinProposal(proposal.id, "test-event");
      expect(result).toEqual({ success: true });

      const after = await findProposal(proposal.id);
      expect(after.hosts.map((h) => h.id).sort()).toEqual(
        [host.id, volunteer.id].sort()
      );
      expect(after.cohostWanted).toBe(false);
      expect(after.cohostWantedNote).toBeUndefined();
    });

    it("removes the vote the volunteer gave the proposal", async () => {
      const event = await createEvent();
      const volunteer = await createGuest({ name: "Vol", eventId: event.id });
      const proposal = await createProposalFixture(event.id, []);
      await getRepositories().votes.upsert({
        proposalId: proposal.id,
        guestId: volunteer.id,
        choice: VoteChoice.interested,
      });
      actAs(volunteer.id);

      await joinProposal(proposal.id, "test-event");

      expect((await findProposal(proposal.id)).votesCount).toBe(0);
    });

    it("refuses a proposal whose hosts did not ask for a co-host", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const intruder = await createGuest({ name: "Intr", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id]);
      actAs(intruder.id);

      const result = await joinProposal(proposal.id, "test-event");
      expect(result).toHaveProperty("error");

      const after = await findProposal(proposal.id);
      expect(after.hosts.map((h) => h.id)).toEqual([host.id]);
    });

    it("refuses when no name is selected", async () => {
      const event = await createEvent();
      const proposal = await createProposalFixture(event.id, []);

      const result = await joinProposal(proposal.id, "test-event");
      expect(result).toHaveProperty("error");

      expect((await findProposal(proposal.id)).hosts).toEqual([]);
    });

    it("refuses a guest who is not part of the event", async () => {
      const event = await createEvent();
      const outsider = await createGuest({ name: "Outsider" });
      const proposal = await createProposalFixture(event.id, []);
      actAs(outsider.id);

      const result = await joinProposal(proposal.id, "test-event");
      expect(result).toHaveProperty("error");

      expect((await findProposal(proposal.id)).hosts).toEqual([]);
    });

    it("tells the hosts, in the app and by mail, who joined them", async () => {
      const event = await createEvent();
      const host = await createGuest({
        name: "Host",
        email: "host@test.example",
        eventId: event.id,
      });
      const volunteer = await createGuest({ name: "Vol", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        title: "Shared Session",
        cohostWanted: true,
      });
      actAs(volunteer.id);

      await joinProposal(proposal.id, event.slug);
      await Promise.all(afterTasks);

      const { notifications } = getRepositories();
      expect(await notifications.listByGuest(host.id)).toMatchObject([
        {
          type: "proposalJoin",
          text: 'Vol joined "Shared Session" as a co-host',
          url: `/${event.slug}/proposals?viewProposal=${proposal.id}`,
        },
      ]);
      expect(await notifications.listByGuest(volunteer.id)).toEqual([]);
      await runJobs();
      expect(vi.mocked(sendMail).mock.calls.map((c) => c[0].to)).toEqual([
        "host@test.example",
      ]);
    });

    it("does not mail a host who opted out, but still tells them in the app", async () => {
      const event = await createEvent();
      const host = await createGuest({
        name: "Host",
        eventId: event.id,
        emailSettings: { proposalJoin: false },
      });
      const volunteer = await createGuest({ name: "Vol", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        cohostWanted: true,
      });
      actAs(volunteer.id);

      await joinProposal(proposal.id, event.slug);
      await Promise.all(afterTasks);

      expect(
        await getRepositories().notifications.listByGuest(host.id)
      ).toHaveLength(1);
      await runJobs();
      expect(sendMail).not.toHaveBeenCalled();
    });

    it("refuses a save from a form the host opened before the volunteer joined", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const volunteer = await createGuest({ name: "Vol", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        cohostWanted: true,
        // In the past: a join in the same millisecond would leave updatedTime as is.
        createdTime: new Date("2026-01-01T00:00:00Z"),
      });
      actAs(volunteer.id);
      await joinProposal(proposal.id, "test-event");

      actAs(host.id);
      const result = await updateProposal(proposal.id, {
        eventSlug: "test-event",
        title: "Reworded",
        hostIds: [host.id],
        cohostWanted: true,
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
      });
      expect(result).toHaveProperty("error");

      const after = await findProposal(proposal.id);
      expect(after.title).toBe(proposal.title);
      expect(after.hosts.map((h) => h.id).sort()).toEqual(
        [host.id, volunteer.id].sort()
      );
      expect(after.cohostWanted).toBe(false);
    });

    it("accepts a save from a form that is still current", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id]);
      actAs(host.id);

      const result = await updateProposal(proposal.id, {
        eventSlug: "test-event",
        title: "Reworded",
        hostIds: [host.id],
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
      });
      expect(result).toEqual({ success: true });

      expect((await findProposal(proposal.id)).title).toBe("Reworded");
    });

    it("leaves the mark alone when a host of the proposal tries to join it", async () => {
      const event = await createEvent();
      const host = await createGuest({ name: "Host", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [host.id], {
        cohostWanted: true,
      });
      actAs(host.id);

      const result = await joinProposal(proposal.id, "test-event");
      expect(result).toHaveProperty("error");

      expect((await findProposal(proposal.id)).cohostWanted).toBe(true);
    });
  });
});
