import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest } from "../helpers/factories";
import { uowFailingAt } from "../helpers/changes";
import { getRepositories } from "@/db/container";
import { unitOfWork, type UnitOfWork } from "@/server/kernel/unit-of-work";
import { createPeopleUseCases } from "@/server/modules/people/module";
import { createSettingsUseCases } from "@/server/modules/settings/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import { getImageRepositories } from "@/utils/images";

const ADMIN: Actor = { admin: true, guest: null };
const NOBODY: Actor = { admin: false, guest: null };

const sendTestEmail = vi.fn(async () => {});
const maps = {
  validate: vi.fn(() =>
    Promise.resolve<{ ext: string } | { error: string }>({ ext: "png" })
  ),
  saveNew: vi.fn(() => Promise.resolve("/media/site/map-1.png")),
  deleteByUrl: vi.fn<(url: string) => Promise<void>>(() => Promise.resolve()),
};
const guests = (uow: UnitOfWork = unitOfWork) =>
  createPeopleUseCases({
    repos: getRepositories(),
    avatars: getImageRepositories().avatars,
    sendTestEmail,
    uow,
  });
const site = () =>
  createSettingsUseCases({ repos: getRepositories(), maps, uow: unitOfWork });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}
const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.clearAllMocks();
});

describe("guest admin use cases", () => {
  it(
    "refuses everyone but an organizer",
    { tags: ["016-US1", "016-US2", "016-US3", "015-US5"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const refusals = [
        await guests().listGuests(NOBODY),
        await guests().createGuest(NOBODY, { name: "A", email: "a@x.org" }),
        await guests().ensureGuest(
          NOBODY,
          { name: "A", email: "a@x.org" },
          new Date()
        ),
        await guests().updateGuest(
          NOBODY,
          {
            id: guest.id,
            expectedVersion: guest.version,
            name: "A",
            email: "a@x.org",
          },
          new Date()
        ),
        await guests().deleteGuest(NOBODY, { id: guest.id }, new Date()),
        await guests().sendTestEmail(NOBODY, { id: guest.id }),
        await guests().assignGuestsToEvent(
          NOBODY,
          {
            eventId: event.id,
            guestIds: [guest.id],
          },
          new Date()
        ),
        await guests().removeGuestsFromEvent(
          NOBODY,
          {
            eventId: event.id,
            guestIds: [guest.id],
          },
          new Date()
        ),
        await guests().importGuests(
          NOBODY,
          {
            csv: "name,email\nA,a@x.org",
            eventIds: [],
          },
          new Date()
        ),
        await site().getSiteSettings(NOBODY),
        await site().updateSiteSettings(NOBODY, {
          title: "T",
          description: "",
        }),
      ];
      expect(refusals.map(code)).toEqual(
        Array(refusals.length).fill("admin.required")
      );
      expect(sendTestEmail).not.toHaveBeenCalled();
      expect(await getRepositories().guests.findById(guest.id)).toBeDefined();
    }
  );

  it(
    "lists guests with their events and never their credentials",
    { tags: ["016-US1", "016-US3"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest({
        name: "Ada",
        email: "ada@x.org",
        eventId: event.id,
      });
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: "secret-hash",
      });

      const listed = value(await guests().listGuests(ADMIN));
      expect(listed).toEqual([
        {
          id: guest.id,
          name: "Ada",
          email: "ada@x.org",
          authProtected: true,
          eventIds: [event.id],
          version: 3,
        },
      ]);
      expect(JSON.stringify(listed)).not.toContain("secret-hash");
    }
  );

  it(
    "reports every invalid field and a taken email on create and update",
    { tags: ["016-US1"] },
    async () => {
      const taken = await createGuest({ email: "taken@x.org" });
      const invalid = await guests().createGuest(ADMIN, {
        name: " ",
        email: "nope",
      });
      expect(invalid).toMatchObject({
        ok: false,
        error: {
          kind: "invalid",
          code: "guest.invalid",
          errors: [
            { path: "email", message: "Invalid email address" },
            { path: "name", message: "Name is required" },
          ],
        },
      });

      const duplicate = {
        ok: false,
        error: {
          kind: "conflict",
          code: "guest.emailTaken",
          detail: "A user with this email already exists",
          errors: [
            { path: "email", message: "A user with this email already exists" },
          ],
        },
      };
      expect(
        await guests().createGuest(ADMIN, {
          name: "Ada",
          email: "TAKEN@x.org",
        })
      ).toEqual(duplicate);

      const ada = value(
        await guests().createGuest(ADMIN, {
          name: " Ada ",
          email: " ada@x.org ",
        })
      );
      expect(ada).toMatchObject({ name: "Ada", email: "ada@x.org" });
      expect(
        await guests().updateGuest(
          ADMIN,
          {
            id: ada.id,
            expectedVersion: ada.version,
            name: "Ada",
            email: "taken@x.org",
          },
          new Date()
        )
      ).toEqual(duplicate);
      expect(
        value(
          await guests().updateGuest(
            ADMIN,
            {
              id: ada.id,
              expectedVersion: ada.version,
              name: "Ada L.",
              email: "ada@x.org",
            },
            new Date()
          )
        )
      ).toMatchObject({ id: ada.id, name: "Ada L." });
      expect(
        code(
          await guests().updateGuest(
            ADMIN,
            {
              id: "nope",
              expectedVersion: 1,
              name: "X",
              email: "x@x.org",
            },
            new Date()
          )
        )
      ).toBe("guest.notFound");
      expect(taken.id).toBeTruthy();
    }
  );

  it(
    "gives an email to only one of two guests changing to it at once",
    { tags: ["016-US1", "019-US7"] },
    async () => {
      const ada = await createGuest();
      const bo = await createGuest();

      const updated = await Promise.all(
        [ada, bo].map((guest) =>
          guests().updateGuest(
            ADMIN,
            {
              id: guest.id,
              expectedVersion: guest.version,
              name: "X",
              email: "x@x.org",
            },
            new Date()
          )
        )
      );

      expect(updated.map(code).sort()).toEqual(["guest.emailTaken", "ok"]);
    }
  );

  it(
    "finds or creates a guest by email and adds them to an event by slug",
    { tags: ["016-US1", "016-US3"] },
    async () => {
      const event = await createEvent();
      const first = value(
        await guests().ensureGuest(
          ADMIN,
          {
            name: "Ada",
            email: "ada@x.org",
            eventSlug: event.slug,
          },
          new Date()
        )
      );
      expect(first.created).toBe(true);
      const again = value(
        await guests().ensureGuest(
          ADMIN,
          { name: "Other", email: "ADA@x.org" },
          new Date()
        )
      );
      expect(again).toEqual({ id: first.id, created: false });
      expect(
        (await getRepositories().guests.listByEvent(event.id)).map((g) => g.id)
      ).toEqual([first.id]);
      expect(
        code(
          await guests().ensureGuest(
            ADMIN,
            {
              name: "Bo",
              email: "bo@x.org",
              eventSlug: "missing",
            },
            new Date()
          )
        )
      ).toBe("event.notFound");
      expect(
        await getRepositories().guests.findByEmail("bo@x.org")
      ).toBeUndefined();
    }
  );

  it(
    "creates no guest when adding them to the event fails",
    { tags: ["016-US1", "019-US7"] },
    async () => {
      const event = await createEvent();

      await expect(
        guests(uowFailingAt("guests", "assignToEvent")).ensureGuest(
          ADMIN,
          {
            name: "Ada",
            email: "ada@x.org",
            eventSlug: event.slug,
          },
          new Date()
        )
      ).rejects.toThrow("guests.assignToEvent failed");

      expect(
        await getRepositories().guests.findByEmail("ada@x.org")
      ).toBeUndefined();
    }
  );

  it(
    "deletes a guest, and mails a test message only to one that exists",
    { tags: ["016-US1"] },
    async () => {
      const guest = await createGuest({ name: "Ada", email: "ada@x.org" });
      value(await guests().sendTestEmail(ADMIN, { id: guest.id }));
      expect(sendTestEmail).toHaveBeenCalledWith({
        name: "Ada",
        email: "ada@x.org",
      });

      sendTestEmail.mockRejectedValueOnce(new Error("smtp down"));
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(await guests().sendTestEmail(ADMIN, { id: guest.id })).toEqual({
        ok: false,
        error: {
          kind: "unavailable",
          code: "mail.failed",
          detail: "Failed to send test email: smtp down",
        },
      });

      value(await guests().deleteGuest(ADMIN, { id: guest.id }, new Date()));
      expect(await getRepositories().guests.findById(guest.id)).toBeUndefined();
      expect(
        code(await guests().deleteGuest(ADMIN, { id: guest.id }, new Date()))
      ).toBe("guest.notFound");
      expect(code(await guests().sendTestEmail(ADMIN, { id: guest.id }))).toBe(
        "guest.notFound"
      );
    }
  );

  it(
    "assigns known guests to an event and removes them",
    { tags: ["016-US3"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const assigned = () =>
        getRepositories()
          .guests.listByEvent(event.id)
          .then((gs) => gs.map((g) => g.id));

      expect(
        code(
          await guests().assignGuestsToEvent(
            ADMIN,
            {
              eventId: "nope",
              guestIds: [guest.id],
            },
            new Date()
          )
        )
      ).toBe("event.notFound");
      expect(
        code(
          await guests().assignGuestsToEvent(
            ADMIN,
            {
              eventId: event.id,
              guestIds: [guest.id, "nope"],
            },
            new Date()
          )
        )
      ).toBe("guest.unknown");
      expect(await assigned()).toEqual([]);

      value(
        await guests().assignGuestsToEvent(
          ADMIN,
          {
            eventId: event.id,
            guestIds: [guest.id, guest.id],
          },
          new Date()
        )
      );
      expect(await assigned()).toEqual([guest.id]);
      value(
        await guests().removeGuestsFromEvent(
          ADMIN,
          {
            eventId: event.id,
            guestIds: [guest.id],
          },
          new Date()
        )
      );
      expect(await assigned()).toEqual([]);
    }
  );

  it(
    "does not add a guest deleted at the same moment to an event",
    { tags: ["016-US3", "019-US7"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();

      const [deleted, added] = await Promise.all([
        guests().deleteGuest(ADMIN, { id: guest.id }, new Date()),
        guests().assignGuestsToEvent(
          ADMIN,
          {
            eventId: event.id,
            guestIds: [guest.id],
          },
          new Date()
        ),
      ]);

      expect(code(deleted)).toBe("ok");
      expect(["ok", "guest.unknown"]).toContain(code(added));
      expect(await getRepositories().guests.listByEvent(event.id)).toEqual([]);
    }
  );

  it(
    "refuses or completes an import into an event deleted at the same moment, never failing",
    { tags: ["016-US2", "019-US7"] },
    async () => {
      const event = await createEvent();

      const [, imported] = await Promise.all([
        getRepositories().events.delete(event.id),
        guests().importGuests(
          ADMIN,
          {
            csv: "name,email\nAda,ada@x.org",
            eventIds: [event.id],
          },
          new Date()
        ),
      ]);

      expect(["ok", "event.notFound"]).toContain(code(imported));
    }
  );

  it(
    "imports a CSV into events, reporting every bad row and importing nothing then",
    { tags: ["016-US2"] },
    async () => {
      const event = await createEvent();
      await createGuest({ email: "old@x.org" });

      const rejected = await guests().importGuests(
        ADMIN,
        {
          csv: "name,email\n,a@x.org\nBo,nope",
          eventIds: [event.id],
        },
        new Date()
      );
      expect(rejected).toEqual({
        ok: false,
        error: {
          kind: "invalid",
          code: "guestImport.invalid",
          detail: "Invalid CSV file",
          errors: [
            { path: "csv", message: "Line 2: name is missing" },
            { path: "csv", message: 'Line 3: invalid email "nope"' },
          ],
        },
      });
      expect(
        code(
          await guests().importGuests(
            ADMIN,
            {
              csv: "name,email\nAda,ada@x.org",
              eventIds: ["nope"],
            },
            new Date()
          )
        )
      ).toBe("event.notFound");
      expect(await getRepositories().guests.listFull()).toHaveLength(1);

      expect(
        value(
          await guests().importGuests(
            ADMIN,
            {
              csv: "name,email\nAda,ada@x.org\nOld,OLD@x.org",
              eventIds: [event.id, event.id],
            },
            new Date()
          )
        )
      ).toEqual({ created: 1, existing: 1 });
      expect(await getRepositories().guests.listByEvent(event.id)).toHaveLength(
        2
      );
    }
  );
});

describe("site settings use cases", () => {
  it(
    "updates the title and map, refusing a missing title or a bad image",
    { tags: ["015-US5"] },
    async () => {
      expect(
        code(
          await site().updateSiteSettings(ADMIN, {
            title: " ",
            description: "",
          })
        )
      ).toBe("settings.titleRequired");

      maps.validate.mockResolvedValueOnce({
        error: "File is not a valid image",
      });
      expect(
        await site().updateSiteSettings(ADMIN, {
          title: "Camp",
          description: "",
          image: Buffer.from([1, 2, 3]),
        })
      ).toEqual({
        ok: false,
        error: {
          kind: "invalid",
          code: "settings.mapInvalid",
          detail: "File is not a valid image",
        },
      });
      expect(maps.saveNew).not.toHaveBeenCalled();

      expect(
        value(
          await site().updateSiteSettings(ADMIN, {
            title: " Camp ",
            description: " Hi ",
            image: Buffer.from([1]),
          })
        )
      ).toEqual({
        title: "Camp",
        description: "Hi",
        mapImageUrl: "/media/site/map-1.png",
      });
      expect(maps.saveNew).toHaveBeenCalledWith(Buffer.from([1]), "png");

      const removed = value(
        await site().updateSiteSettings(ADMIN, {
          title: "Camp",
          description: "",
          removeMap: true,
        })
      );
      expect(removed.mapImageUrl).toBe("");
      expect(maps.deleteByUrl.mock.calls).toEqual([["/media/site/map-1.png"]]);
      expect(value(await site().getSiteSettings(ADMIN))).toEqual(removed);
    }
  );

  it(
    "keeps the map when a later save changes only the title",
    { tags: ["015-US5", "019-US7"] },
    async () => {
      value(
        await site().updateSiteSettings(ADMIN, {
          title: "Camp",
          description: "",
          image: Buffer.from([1]),
        })
      );
      const retitled = value(
        await site().updateSiteSettings(ADMIN, {
          title: "Camp 2",
          description: "",
        })
      );
      expect(retitled.mapImageUrl).toBe("/media/site/map-1.png");
      expect(maps.deleteByUrl).not.toHaveBeenCalled();
      expect((await getRepositories().settings.get()).mapImageUrl).toBe(
        "/media/site/map-1.png"
      );
    }
  );
});
