// @module-tag 016-US1
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import {
  createGuestAction,
  deleteGuestAction,
  loginAsAdmin,
  logoutAdmin,
  sendTestEmailAction,
  updateGuestAction,
} from "../helpers/admin-api";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createProposal,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { testEmail } from "@/emails/test-email";
import { sendMail } from "@/utils/mailer";
import { VoteChoice } from "@schellingboard/domain/vote";
import { DEFAULT_EMAIL_SETTINGS } from "@schellingboard/domain/guest";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

describe("admin guest actions", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await loginAsAdmin();
  });

  afterEach(() => vi.unstubAllEnvs());

  describe("authorization", () => {
    it("rejects createGuestAction without an admin cookie", async () => {
      logoutAdmin();
      const result = await createGuestAction({
        name: "Eve",
        email: "eve@test.example",
      });
      expect(result).toEqual({ ok: false, error: "Unauthorized" });
      expect(
        await getRepositories().guests.findByEmail("eve@test.example")
      ).toBeUndefined();
    });

    it("rejects updateGuestAction and deleteGuestAction without an admin cookie", async () => {
      const guest = await createGuest();
      logoutAdmin();
      expect(
        await updateGuestAction({
          id: guest.id,
          expectedVersion: guest.version,
          name: "X",
          email: "x@x.de",
        })
      ).toEqual({ ok: false, error: "Unauthorized" });
      expect(await deleteGuestAction({ id: guest.id })).toEqual({
        ok: false,
        error: "Unauthorized",
      });
      expect(await getRepositories().guests.findById(guest.id)).toBeDefined();
    });

    it("rejects sendTestEmailAction without an admin cookie", async () => {
      const guest = await createGuest();
      logoutAdmin();
      expect(await sendTestEmailAction({ id: guest.id })).toEqual({
        ok: false,
        error: "Unauthorized",
      });
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe("createGuestAction", () => {
    it("creates a guest", async () => {
      const result = await createGuestAction({
        name: "Alice",
        email: "alice@test.example",
      });
      expect(result).toEqual({ ok: true });
      const guest =
        await getRepositories().guests.findByEmail("alice@test.example");
      expect(guest).toMatchObject({ name: "Alice" });
    });

    it("trims whitespace", async () => {
      await createGuestAction({
        name: "  Alice  ",
        email: " alice@test.example ",
      });
      const guest =
        await getRepositories().guests.findByEmail("alice@test.example");
      expect(guest?.name).toBe("Alice");
    });

    it("requires a name", async () => {
      const result = await createGuestAction({
        name: "  ",
        email: "alice@test.example",
      });
      expect(result).toMatchObject({
        ok: false,
        error: [
          {
            path: ["name"],
            message: "Name is required",
          },
        ],
      });
    });

    it("rejects an invalid email", async () => {
      const result = await createGuestAction({
        name: "Alice",
        email: "not-an-email",
      });
      expect(result).toMatchObject({
        ok: false,
        error: [
          {
            path: ["email"],
            message: "Invalid email address",
          },
        ],
      });
    });

    it("rejects a duplicate email", async () => {
      await createGuest({ email: "taken@test.example" });
      const result = await createGuestAction({
        name: "Alice",
        email: "taken@test.example",
      });
      expect(result).toMatchObject({
        ok: false,
        error: [
          {
            code: "custom",
            path: ["email"],
            message: "A user with this email already exists",
          },
        ],
      });
    });
  });

  describe("updateGuestAction", () => {
    it("updates name and email", async () => {
      const guest = await createGuest();
      const result = await updateGuestAction({
        id: guest.id,
        expectedVersion: guest.version,
        name: "New Name",
        email: "new@test.example",
      });
      expect(result).toEqual({ ok: true });
      const updated = await getRepositories().guests.findById(guest.id);
      expect(updated).toMatchObject({
        name: "New Name",
        info: { email: "new@test.example" },
      });
    });

    it("allows keeping the guest's own email", async () => {
      const guest = await createGuest({ email: "keep@test.example" });
      const result = await updateGuestAction({
        id: guest.id,
        expectedVersion: guest.version,
        name: "Renamed",
        email: "keep@test.example",
      });
      expect(result).toEqual({ ok: true });
    });

    it("rejects an email belonging to another guest", async () => {
      await createGuest({ email: "taken@test.example" });
      const guest = await createGuest({ email: "mine@test.example" });
      const result = await updateGuestAction({
        id: guest.id,
        expectedVersion: guest.version,
        name: "Name",
        email: "taken@test.example",
      });
      expect(result).toMatchObject({
        ok: false,
        error: [
          {
            path: ["email"],
            message: "A user with this email already exists",
          },
        ],
      });
    });

    it("refuses an edit from a version the guest has moved past", async () => {
      const guest = await createGuest({ email: "mine@test.example" });
      const edit = (name: string) =>
        updateGuestAction({
          id: guest.id,
          name,
          email: "mine@test.example",
          expectedVersion: guest.version,
        });

      expect(await edit("First")).toEqual({ ok: true });
      expect(await edit("Second")).toEqual({
        ok: false,
        error: expect.stringMatching(
          /^Someone changed this guest while you edited it\. Copy your edits/
        ) as string,
      });
      expect((await getRepositories().guests.findById(guest.id))?.name).toBe(
        "First"
      );
    });

    it("refuses an edit that names no version", async () => {
      const guest = await createGuest({ email: "mine@test.example" });
      const result = await updateGuestAction({
        id: guest.id,
        name: "Renamed",
        email: "mine@test.example",
      } as Parameters<typeof updateGuestAction>[0]);
      expect(result.ok).toBe(false);
      expect((await getRepositories().guests.findById(guest.id))?.name).toBe(
        guest.name
      );
    });

    it("errors for an unknown id", async () => {
      const result = await updateGuestAction({
        id: "does-not-exist",
        expectedVersion: 1,
        name: "Name",
        email: "x@test.example",
      });
      expect(result).toEqual({ ok: false, error: "User not found" });
    });
  });

  describe("email settings", () => {
    it("gives new guests the default email settings", async () => {
      const result = await createGuestAction({
        name: "Alice",
        email: "alice@test.example",
      });
      expect(result).toEqual({ ok: true });
      const guest =
        await getRepositories().guests.findByEmail("alice@test.example");
      expect(guest?.info.emailSettings).toEqual(DEFAULT_EMAIL_SETTINGS);
    });
  });

  describe("deleteGuestAction", () => {
    it("deletes a guest", async () => {
      const guest = await createGuest();
      const result = await deleteGuestAction({ id: guest.id });
      expect(result).toEqual({ ok: true });
      expect(await getRepositories().guests.findById(guest.id)).toBeUndefined();
    });

    it("errors for an unknown id", async () => {
      const result = await deleteGuestAction({ id: "does-not-exist" });
      expect(result).toEqual({ ok: false, error: "User not found" });
    });

    it("cascade-deletes votes, RSVPs, and host links, leaving other data intact", async () => {
      const repos = getRepositories();
      const event = await createEvent();
      const guest = await createGuest();
      const otherGuest = await createGuest();

      const proposal = await createProposal(event.id, [
        guest.id,
        otherGuest.id,
      ]);
      const session = await createSession(event.id, {
        hostIds: [guest.id, otherGuest.id],
      });
      await repos.votes.create({
        proposalId: proposal.id,
        guestId: guest.id,
        choice: VoteChoice.interested,
      });
      await repos.votes.create({
        proposalId: proposal.id,
        guestId: otherGuest.id,
        choice: VoteChoice.maybe,
      });
      await repos.rsvps.create({ sessionId: session.id, guestId: guest.id });
      await repos.rsvps.create({
        sessionId: session.id,
        guestId: otherGuest.id,
      });

      const result = await deleteGuestAction({ id: guest.id });
      expect(result).toEqual({ ok: true });

      expect(await repos.guests.findById(guest.id)).toBeUndefined();
      expect(await repos.votes.listByGuestAndEvent(guest.id, event.id)).toEqual(
        []
      );
      expect(await repos.rsvps.listByGuest(guest.id)).toEqual([]);

      const proposalAfter = await repos.sessionProposals.findById(proposal.id);
      expect(proposalAfter?.hosts.map((h) => h.id)).toEqual([otherGuest.id]);
      const sessionAfter = await repos.sessions.findById(session.id);
      expect(sessionAfter?.hosts.map((h) => h.id)).toEqual([otherGuest.id]);

      // Other guest's data is untouched
      expect(await repos.guests.findById(otherGuest.id)).toBeDefined();
      expect(
        await repos.votes.listByGuestAndEvent(otherGuest.id, event.id)
      ).toHaveLength(1);
      expect(await repos.rsvps.listByGuest(otherGuest.id)).toHaveLength(1);
    });
  });

  describe("sendTestEmailAction", () => {
    it("sends a test email to the guest's address", async () => {
      const guest = await createGuest({
        name: "Ada Lovelace",
        email: "guest@test.example",
      });
      const result = await sendTestEmailAction({ id: guest.id });
      expect(result).toEqual({ ok: true });
      expect(sendMail).toHaveBeenCalledOnce();

      // We don't test anything about the email's content, but we do test that
      // we sent to the correct address and filled in the correct name.
      expect(vi.mocked(sendMail).mock.calls[0][0]).toEqual({
        to: "guest@test.example",
        ...testEmail({ name: "Ada Lovelace" }),
      });
    });

    it("errors for an unknown id", async () => {
      const result = await sendTestEmailAction({ id: "does-not-exist" });
      expect(result).toEqual({ ok: false, error: "User not found" });
      expect(sendMail).not.toHaveBeenCalled();
    });

    it("returns a helpful error when sending fails", async () => {
      vi.mocked(sendMail).mockRejectedValueOnce(new Error("boom"));
      const guest = await createGuest();
      const result = await sendTestEmailAction({ id: guest.id });
      expect(result).toEqual({
        ok: false,
        error: "Failed to send test email: boom",
      });
    });
  });
});
