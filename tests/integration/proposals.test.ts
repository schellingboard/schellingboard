// @module-tag 004-US1
// @module-tag 004-US2
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
import { siteAuthenticate } from "../helpers/site-auth";
import {
  createEvent,
  createGuest,
  createProposal as createProposalFixture,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";
import {
  createProposal,
  updateProposal,
} from "@/app/(site)/[eventSlug]/proposals/actions";
import { TIME_OFFSET_COOKIE } from "@/utils/dev-clock";
import { VoteChoice } from "@/db/repositories/interfaces";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

async function protectGuest(guestId: string): Promise<void> {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

/**
 * The form reports validation errors next to the field they belong to, so the
 * actions must return issues carrying a field path rather than a bare string.
 */
function errorFields(result: object): string[] {
  const error = "error" in result ? result.error : undefined;
  if (!Array.isArray(error))
    throw new Error(`not field issues: ${String(error)}`);
  return error.map((issue: { path: PropertyKey[] }) => issue.path.join("."));
}

describe("createProposal", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    // Creating requires a name to be selected. Tests that care about *which*
    // name overwrite this; the rest just need to be past the identity gate.
    cookieJar.set(
      GUEST_COOKIE_NAME,
      openGuestValue((await createGuest({ name: "Proposer" })).id)
    );
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("creates a proposal with hosts and duration, readable via listByEvent", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host", eventId: event.id });

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "My Proposal",
      description: "A description",
      hostIds: [host.id],
      durationMinutes: 60,
    });
    expect(result).toEqual({ success: true });

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    expect(proposals).toHaveLength(1);
    expect(proposals[0]).toMatchObject({
      title: "My Proposal",
      description: "A description",
      durationMinutes: 60,
    });
    expect(proposals[0].hosts.map((h) => h.id)).toEqual([host.id]);
  });

  it("rejects a host who is not part of the event", async () => {
    const event = await createEvent();
    const outsider = await createGuest({ name: "Outsider" }); // not assigned

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "My Proposal",
      hostIds: [outsider.id],
    });
    expect(errorFields(result)).toEqual(["hostIds"]);

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    expect(proposals).toHaveLength(0);
  });

  it("rejects a missing title and leaves the event's proposals unchanged", async () => {
    const event = await createEvent();

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "",
    });
    expect(errorFields(result)).toEqual(["title"]);

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    expect(proposals).toHaveLength(0);
  });

  it("rejects a whitespace-only title", async () => {
    const event = await createEvent();

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "   ",
    });
    expect(errorFields(result)).toEqual(["title"]);

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    expect(proposals).toHaveLength(0);
  });

  it("rejects a missing event", async () => {
    const result = await createProposal({
      eventSlug: "test-event",
      title: "No Event",
    } as never);
    expect(result).toHaveProperty("error");
  });

  it("rejects creating as a protected guest without a verified session", async () => {
    const event = await createEvent();
    const guest = await createGuest({ name: "Host", eventId: event.id });
    await protectGuest(guest.id);
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guest.id));

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "My Proposal",
      hostIds: [guest.id],
    });
    expect(result).toHaveProperty("error");

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    expect(proposals).toHaveLength(0);
  });

  it("creates as a protected guest with a verified session", async () => {
    const event = await createEvent();
    const guest = await createGuest({ name: "Host", eventId: event.id });
    await protectGuest(guest.id);
    cookieJar.set(GUEST_COOKIE_NAME, await verifiedGuestValue(guest.id));

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "My Proposal",
      hostIds: [guest.id],
    });
    expect(result).toEqual({ success: true });

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    expect(proposals).toHaveLength(1);
  });

  // A proposal's createdTime is shown and sorted next to the comments posted on
  // it, and those are stamped with serverNow() — so it has to follow the same
  // clock or a time-travelled session sees the two disagree.
  it("stamps a proposal with the offset the dev toolbar is holding", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
    const event = await createEvent();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    cookieJar.set(TIME_OFFSET_COOKIE, String(threeDays));

    const result = await createProposal({
      eventId: event.id,
      eventSlug: "test-event",
      title: "Time-travelled",
      hostIds: [],
    });
    expect(result).toEqual({ success: true });

    const [proposal] = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    const shift = proposal.createdTime.getTime() - Date.now();
    expect(Math.abs(shift - threeDays)).toBeLessThan(60_000);
  });
});

describe("updateProposal", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("updates title, description, hosts, and duration", async () => {
    const event = await createEvent();
    const alice = await createGuest({ name: "Alice", eventId: event.id });
    const bob = await createGuest({ name: "Bob", eventId: event.id });
    const proposal = await createProposalFixture(event.id, [alice.id], {
      title: "Original",
      durationMinutes: 30,
    });
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(alice.id));

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "Updated",
      description: "New description",
      hostIds: [alice.id, bob.id],
      durationMinutes: 90,
    });
    expect(result).toEqual({ success: true });

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after).toMatchObject({
      title: "Updated",
      description: "New description",
      durationMinutes: 90,
    });
    expect(after?.hosts.map((h) => h.id).sort()).toEqual(
      [alice.id, bob.id].sort()
    );
  });

  it("removes all hosts and clears the duration", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host" });
    const proposal = await createProposalFixture(event.id, [host.id], {
      durationMinutes: 60,
    });
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(host.id));

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: proposal.title,
      durationMinutes: undefined,
    });
    expect(result).toEqual({ success: true });

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.hosts).toEqual([]);
    expect(after?.durationMinutes).toBeUndefined();
  });

  describe("last updated", () => {
    const created = new Date("2026-03-01T10:00:00Z");

    async function hostedProposal() {
      const event = await createEvent();
      const alice = await createGuest({ name: "Alice", eventId: event.id });
      const bob = await createGuest({ name: "Bob", eventId: event.id });
      const proposal = await createProposalFixture(event.id, [alice.id], {
        title: "Original",
        description: "As written",
        durationMinutes: 30,
        createdTime: created,
      });
      cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(alice.id));
      const unchanged = {
        eventSlug: "test-event",
        title: "Original",
        description: "As written",
        hostIds: [alice.id],
        durationMinutes: 30,
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
      };
      const updatedTime = async () =>
        (await getRepositories().sessionProposals.findById(proposal.id))!
          .updatedTime;
      return { proposal, alice, bob, unchanged, updatedTime };
    }

    it("starts out as the time the proposal was created", async () => {
      const { updatedTime } = await hostedProposal();
      expect(await updatedTime()).toEqual(created);
    });

    it.each([
      ["title", { title: "Reworded" }],
      ["description", { description: "Rewritten" }],
      ["duration", { durationMinutes: 60 }],
    ])("moves when the %s changes", async (_field, change) => {
      const { proposal, unchanged, updatedTime } = await hostedProposal();

      const result = await updateProposal(proposal.id, {
        ...unchanged,
        ...change,
      });
      expect(result).toEqual({ success: true });

      expect((await updatedTime()).getTime()).toBeGreaterThan(
        created.getTime()
      );
    });

    it("moves when a co-host joins", async () => {
      const { proposal, alice, bob, unchanged, updatedTime } =
        await hostedProposal();

      await updateProposal(proposal.id, {
        ...unchanged,
        hostIds: [alice.id, bob.id],
      });

      expect((await updatedTime()).getTime()).toBeGreaterThan(
        created.getTime()
      );
    });

    // The edit form submits every field, so opening it and pressing Submit
    // must not count as an edit.
    it("stays put when a save changes nothing", async () => {
      const { proposal, unchanged, updatedTime } = await hostedProposal();

      const result = await updateProposal(proposal.id, unchanged);
      expect(result).toEqual({ success: true });

      expect(await updatedTime()).toEqual(created);
    });

    it("stays put when someone votes", async () => {
      const { proposal, bob, updatedTime } = await hostedProposal();

      await getRepositories().votes.upsert({
        proposalId: proposal.id,
        guestId: bob.id,
        choice: VoteChoice.interested,
      });

      expect(await updatedTime()).toEqual(created);
    });
  });

  it("rejects a missing title and leaves the proposal unchanged", async () => {
    const event = await createEvent();
    const proposal = await createProposalFixture(event.id, [], {
      title: "Keep Me",
    });

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "",
    });
    expect(errorFields(result)).toEqual(["title"]);

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Keep Me");
  });

  // The form always submits every field, so an update without a title is a
  // malformed payload, not a request to leave the title alone.
  it("rejects an omitted title and leaves the proposal unchanged", async () => {
    const event = await createEvent();
    const proposal = await createProposalFixture(event.id, [], {
      title: "Keep Me",
    });

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
    } as never);
    expect(errorFields(result)).toEqual(["title"]);

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Keep Me");
  });

  it("rejects a save that does not say which version it edits", async () => {
    const event = await createEvent();
    const proposal = await createProposalFixture(event.id, [], {
      title: "Keep Me",
    });

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      title: "Changed",
    } as never);
    expect(errorFields(result)).toEqual(["expectedUpdatedTime"]);

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Keep Me");
  });

  it("rejects a host who is not part of the event", async () => {
    const event = await createEvent();
    const alice = await createGuest({ name: "Alice", eventId: event.id });
    const outsider = await createGuest({ name: "Outsider" }); // not assigned
    const proposal = await createProposalFixture(event.id, [alice.id]);
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(alice.id));

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: proposal.title,
      hostIds: [outsider.id],
    });
    expect(errorFields(result)).toEqual(["hostIds"]);

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.hosts.map((h) => h.id)).toEqual([alice.id]);
  });

  it("rejects a non-host attempting to edit", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host", eventId: event.id });
    const nonHost = await createGuest({ name: "NonHost", eventId: event.id });
    const proposal = await createProposalFixture(event.id, [host.id], {
      title: "Original",
    });
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(nonHost.id));

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "Hijacked",
    });
    expect(result).toHaveProperty("error");

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Original");
  });

  it("rejects editing with no acting guest at all", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host", eventId: event.id });
    const proposal = await createProposalFixture(event.id, [host.id], {
      title: "Original",
    });

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "Hijacked",
    });
    expect(result).toHaveProperty("error");

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Original");
  });

  it("allows anyone to edit a hostless proposal", async () => {
    const event = await createEvent();
    const proposal = await createProposalFixture(event.id, [], {
      title: "Unclaimed",
    });

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "Claimed by nobody",
    });
    expect(result).toEqual({ success: true });

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Claimed by nobody");
  });

  it("rejects a protected host without a verified session", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host", eventId: event.id });
    await protectGuest(host.id);
    const proposal = await createProposalFixture(event.id, [host.id], {
      title: "Original",
    });
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(host.id));

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "Hijacked",
    });
    expect(result).toHaveProperty("error");

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Original");
  });

  it("accepts a protected host with a verified session", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host", eventId: event.id });
    await protectGuest(host.id);
    const proposal = await createProposalFixture(event.id, [host.id], {
      title: "Original",
    });
    cookieJar.set(GUEST_COOKIE_NAME, await verifiedGuestValue(host.id));

    const result = await updateProposal(proposal.id, {
      eventSlug: "test-event",
      expectedUpdatedTime: proposal.updatedTime.toISOString(),
      title: "Renamed",
    });
    expect(result).toEqual({ success: true });

    const after = await getRepositories().sessionProposals.findById(
      proposal.id
    );
    expect(after?.title).toBe("Renamed");
  });
});
