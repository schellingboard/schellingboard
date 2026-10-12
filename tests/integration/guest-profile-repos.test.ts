// @module-tag 011-US1
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createProposal,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { DEFAULT_EMAIL_SETTINGS } from "@schellingboard/domain/guest";

describe("guest profile repositories", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  describe("guests.findOrCreateByEmail", () => {
    it("creates a new guest when the email is unused", async () => {
      const { guests } = getRepositories();
      const { guest, created } = await guests.findOrCreateByEmail({
        name: "New Guest",
        info: { email: "new@test.example" },
      });
      expect(created).toBe(true);
      expect(await guests.findById(guest.id)).toMatchObject({
        name: "New Guest",
      });
    });

    it("returns the existing guest without creating a duplicate row when the email (any case) already exists", async () => {
      const { guests } = getRepositories();
      const existing = await createGuest({
        name: "Existing",
        email: "dup@test.example",
      });

      const { guest, created } = await guests.findOrCreateByEmail({
        name: "Someone Else",
        info: { email: "Dup@Test.Example" },
      });

      expect(created).toBe(false);
      expect(guest.id).toBe(existing.id);
      expect(guest.name).toBe("Existing");
      const all = await guests.listFull();
      expect(
        all.filter((g) => g.info.email.toLowerCase() === "dup@test.example")
      ).toHaveLength(1);
    });
  });

  describe("guests table uniqueness", () => {
    it("rejects inserting two guests with the same email up to case", async () => {
      const { guests } = getRepositories();
      await createGuest({ name: "A", email: "case@test.example" });
      await expect(
        guests.create({
          name: "B",
          info: { email: "Case@Test.Example" },
        })
      ).rejects.toThrow(/UNIQUE constraint failed/i);
    });
  });

  describe("guests.updateProfile", () => {
    it("updates name and aboutMe, leaving email intact", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest({ name: "Old", email: "g@test.example" });

      const updated = await guests.updateProfile(
        guest.id,
        {
          name: "New Name",
          aboutMe: "I love unconferences.",
          avatarUrl: "/media/uploads/avatar.png",
          pronouns: "they/them",
          basedIn: null,
          prompts: null,
          languages: null,
          contacts: null,
        },
        new Date()
      );

      expect(updated).toMatchObject({
        id: guest.id,
        name: "New Name",
        aboutMe: "I love unconferences.",
        avatarUrl: "/media/uploads/avatar.png",
        info: { email: "g@test.example" },
      });
      const fetched = await guests.findById(guest.id);
      expect(fetched).toMatchObject({
        name: "New Name",
        aboutMe: "I love unconferences.",
        avatarUrl: "/media/uploads/avatar.png",
      });
    });
  });

  describe("guests.updateProfile profileUpdatedAt", () => {
    const profile = {
      name: "Someone",
      aboutMe: null,
      avatarUrl: null,
      pronouns: null,
      basedIn: null,
      prompts: null,
      languages: null,
      contacts: null,
    };
    const FIRST = new Date("2026-05-01T10:00:00Z");
    const LATER = new Date("2026-06-02T09:30:00Z");

    it("is null until the guest fills something in", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest({ name: "Someone" });

      expect((await guests.findById(guest.id))?.profileUpdatedAt).toBeNull();

      await guests.updateProfile(
        guest.id,
        { ...profile, basedIn: "Vienna" },
        FIRST
      );

      expect((await guests.findById(guest.id))?.profileUpdatedAt).toEqual(
        FIRST
      );
    });

    it("is not touched when the profile is saved unchanged", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest({ name: "Someone" });
      const filled = { ...profile, languages: ["Dutch"] };
      await guests.updateProfile(guest.id, filled, FIRST);

      await guests.updateProfile(guest.id, filled, LATER);

      expect((await guests.findById(guest.id))?.profileUpdatedAt).toEqual(
        FIRST
      );
    });

    it("is bumped when the guest renames themselves", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest({ name: "Someone" });

      await guests.updateProfile(
        guest.id,
        { ...profile, name: "Someone Else" },
        LATER
      );

      expect((await guests.findById(guest.id))?.profileUpdatedAt).toEqual(
        LATER
      );
    });

    it("is bumped when a public profile field changes", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest({ name: "Someone" });
      await guests.updateProfile(
        guest.id,
        { ...profile, aboutMe: "First draft" },
        FIRST
      );

      await guests.updateProfile(
        guest.id,
        { ...profile, aboutMe: "Second draft" },
        LATER
      );

      expect((await guests.findById(guest.id))?.profileUpdatedAt).toEqual(
        LATER
      );
    });
  });

  describe("guests.updateProfile extended fields", () => {
    it("stores and returns basedIn, prompts, languages, and contacts", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest();

      const updated = await guests.updateProfile(
        guest.id,
        {
          name: guest.name,
          aboutMe: null,
          avatarUrl: null,
          pronouns: null,
          basedIn: "Berlin",
          prompts: [{ prompt: "Ask me about", answer: "Urban beekeeping" }],
          languages: ["German", "Swiss German"],
          contacts: [
            { type: "signal", value: "@someone.01" },
            { type: "other", label: "Matrix", value: "@someone:matrix.org" },
          ],
        },
        new Date()
      );

      expect(updated).toMatchObject({ id: guest.id, basedIn: "Berlin" });
      const fetched = await guests.findById(guest.id);
      expect(fetched?.basedIn).toBe("Berlin");
      expect(fetched?.prompts).toEqual([
        { prompt: "Ask me about", answer: "Urban beekeeping" },
      ]);
      expect(fetched?.languages).toEqual(["German", "Swiss German"]);
      expect(fetched?.contacts).toEqual([
        { type: "signal", value: "@someone.01" },
        { type: "other", label: "Matrix", value: "@someone:matrix.org" },
      ]);
    });

    it("leaves the new fields empty for guests that never set them", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest();

      const fetched = await guests.findById(guest.id);
      expect(fetched?.basedIn ?? null).toBeNull();
      expect(fetched?.prompts ?? null).toBeNull();
      expect(fetched?.languages ?? null).toBeNull();
      expect(fetched?.contacts ?? null).toBeNull();
    });
  });

  describe("sessions.listHostedByGuest", () => {
    it("returns only sessions the guest hosts", async () => {
      const { sessions } = getRepositories();
      const event = await createEvent();
      const guest = await createGuest();
      const other = await createGuest();

      const hosted = await createSession(event.id, {
        title: "Mine",
        hostIds: [guest.id],
      });
      await createSession(event.id, { title: "Theirs", hostIds: [other.id] });

      const result = await sessions.listHostedByGuest(guest.id);
      expect(result.map((s) => s.id)).toEqual([hosted.id]);
      expect(result[0].hosts.map((h) => h.id)).toContain(guest.id);
    });
  });

  describe("sessions.listRsvpdByGuest", () => {
    it("returns only sessions the guest RSVP'd to", async () => {
      const { sessions, rsvps } = getRepositories();
      const event = await createEvent();
      const guest = await createGuest();

      const attended = await createSession(event.id, { title: "Going" });
      await createSession(event.id, { title: "Not going" });
      await rsvps.create({ sessionId: attended.id, guestId: guest.id });

      const result = await sessions.listRsvpdByGuest(guest.id);
      expect(result.map((s) => s.id)).toEqual([attended.id]);
    });
  });

  describe("sessionProposals.listByHost", () => {
    it("returns only proposals the guest hosts", async () => {
      const { sessionProposals } = getRepositories();
      const event = await createEvent();
      const guest = await createGuest();
      const other = await createGuest();

      const mine = await createProposal(event.id, [guest.id], {
        title: "My proposal",
      });
      await createProposal(event.id, [other.id], { title: "Their proposal" });

      const result = await sessionProposals.listByHost(guest.id);
      expect(result.map((p) => p.id)).toEqual([mine.id]);
    });
  });

  describe("guests version", () => {
    it("goes up once per change to a guest's admin view or events, and not for a no-op", async () => {
      const { guests, events } = getRepositories();
      const event = await createEvent();
      const other = await createEvent();
      const guest = await createGuest({ email: "ada@x.org" });
      const version = async () => (await guests.findById(guest.id))!.version;
      const steps: [() => Promise<unknown>, number][] = [
        [() => guests.assignToEvent(event.id, [guest.id]), 2],
        [() => guests.assignToEvent(event.id, [guest.id]), 2],
        [() => guests.removeFromEvent(event.id, [guest.id]), 3],
        [() => guests.removeFromEvent(event.id, [guest.id]), 3],
        [
          () =>
            guests.importAndAssign(
              [{ name: "Ada", email: "ADA@x.org" }],
              [event.id, other.id]
            ),
          4,
        ],
        [() => events.delete(other.id), 5],
        [
          () =>
            guests.setAuthProtection(guest.id, {
              authProtected: true,
              passwordHash: "h1",
            }),
          6,
        ],
        [
          () =>
            guests.setAuthProtection(guest.id, {
              authProtected: true,
              passwordHash: "h2",
            }),
          6,
        ],
        [
          () =>
            guests.updateEmailSettings(guest.id, {
              ...DEFAULT_EMAIL_SETTINGS,
              commentThread: true,
            }),
          6,
        ],
        [
          () =>
            guests.update(guest.id, {
              name: guest.name,
              info: { email: "ada@x.org" },
            }),
          6,
        ],
        [
          () =>
            guests.update(guest.id, {
              name: guest.name,
              info: { email: "ada@y.org" },
              expectedVersion: 5,
            }),
          6,
        ],
      ];
      for (const [step, expected] of steps) {
        await step();
        expect(await version()).toBe(expected);
      }
      expect(await guests.findById(guest.id)).toMatchObject({
        info: { email: "ada@x.org" },
        profileVersion: 1,
      });
    });

    it("keeps a profile version that only profile fields and the name raise", async () => {
      const { guests } = getRepositories();
      const guest = await createGuest({ name: "Ada", email: "ada@x.org" });
      const profile = {
        name: "Ada",
        aboutMe: "Hi",
        avatarUrl: null,
        pronouns: null,
        basedIn: null,
        prompts: null,
        languages: null,
        contacts: null,
      };
      const versions = async () => {
        const g = (await guests.findById(guest.id))!;
        return [g.profileVersion, g.version];
      };

      await guests.updateProfile(guest.id, profile, new Date());
      expect(await versions()).toEqual([2, 1]);
      await guests.updateProfile(
        guest.id,
        { ...profile, expectedVersion: 1 },
        new Date()
      );
      expect(await versions()).toEqual([2, 1]);
      await guests.updateProfile(
        guest.id,
        { ...profile, name: "Ada L.", expectedVersion: 2 },
        new Date()
      );
      expect(await versions()).toEqual([3, 2]);
      await guests.update(guest.id, {
        name: "Ada L.",
        info: { email: "ada@y.org" },
      });
      expect(await versions()).toEqual([3, 3]);
      await guests.update(guest.id, {
        name: "Ada",
        info: { email: "ada@y.org" },
      });
      expect(await versions()).toEqual([4, 4]);
    });
  });
});
