import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest } from "../helpers/factories";
import { getRepositories } from "@/db/container";
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
  save: vi.fn(() => Promise.resolve("/media/site/map.png?v=1")),
  delete: vi.fn(async () => {}),
};
const guests = () =>
  createPeopleUseCases({
    repos: getRepositories(),
    avatars: getImageRepositories().avatars,
    sendTestEmail,
  });
const site = () => createSettingsUseCases({ repos: getRepositories(), maps });

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
        await guests().ensureGuest(NOBODY, { name: "A", email: "a@x.org" }),
        await guests().updateGuest(NOBODY, {
          id: guest.id,
          name: "A",
          email: "a@x.org",
        }),
        await guests().deleteGuest(NOBODY, { id: guest.id }),
        await guests().sendTestEmail(NOBODY, { id: guest.id }),
        await guests().assignGuestsToEvent(NOBODY, {
          eventId: event.id,
          guestIds: [guest.id],
        }),
        await guests().removeGuestsFromEvent(NOBODY, {
          eventId: event.id,
          guestIds: [guest.id],
        }),
        await guests().importGuests(NOBODY, {
          csv: "name,email\nA,a@x.org",
          eventIds: [],
        }),
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
        await guests().updateGuest(ADMIN, {
          id: ada.id,
          name: "Ada",
          email: "taken@x.org",
        })
      ).toEqual(duplicate);
      expect(
        value(
          await guests().updateGuest(ADMIN, {
            id: ada.id,
            name: "Ada L.",
            email: "ada@x.org",
          })
        )
      ).toMatchObject({ id: ada.id, name: "Ada L." });
      expect(
        code(
          await guests().updateGuest(ADMIN, {
            id: "nope",
            name: "X",
            email: "x@x.org",
          })
        )
      ).toBe("guest.notFound");
      expect(taken.id).toBeTruthy();
    }
  );

  it(
    "turns an email taken between the check and the update into a conflict",
    { tags: ["016-US1"] },
    async () => {
      const guest = await createGuest();
      await createGuest({ email: "x@x.org" });
      const { guests: repo } = getRepositories();
      const check = vi
        .spyOn(repo, "findByEmail")
        .mockResolvedValueOnce(undefined);
      expect(
        code(
          await guests().updateGuest(ADMIN, {
            id: guest.id,
            name: "X",
            email: "x@x.org",
          })
        )
      ).toBe("guest.emailTaken");
      check.mockRestore();
    }
  );

  it(
    "finds or creates a guest by email and adds them to an event by slug",
    { tags: ["016-US1", "016-US3"] },
    async () => {
      const event = await createEvent();
      const first = value(
        await guests().ensureGuest(ADMIN, {
          name: "Ada",
          email: "ada@x.org",
          eventSlug: event.slug,
        })
      );
      expect(first.created).toBe(true);
      const again = value(
        await guests().ensureGuest(ADMIN, { name: "Other", email: "ADA@x.org" })
      );
      expect(again).toEqual({ id: first.id, created: false });
      expect(
        (await getRepositories().guests.listByEvent(event.id)).map((g) => g.id)
      ).toEqual([first.id]);
      expect(
        code(
          await guests().ensureGuest(ADMIN, {
            name: "Bo",
            email: "bo@x.org",
            eventSlug: "missing",
          })
        )
      ).toBe("event.notFound");
      expect(
        await getRepositories().guests.findByEmail("bo@x.org")
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

      value(await guests().deleteGuest(ADMIN, { id: guest.id }));
      expect(await getRepositories().guests.findById(guest.id)).toBeUndefined();
      expect(code(await guests().deleteGuest(ADMIN, { id: guest.id }))).toBe(
        "guest.notFound"
      );
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
          await guests().assignGuestsToEvent(ADMIN, {
            eventId: "nope",
            guestIds: [guest.id],
          })
        )
      ).toBe("event.notFound");
      expect(
        code(
          await guests().assignGuestsToEvent(ADMIN, {
            eventId: event.id,
            guestIds: [guest.id, "nope"],
          })
        )
      ).toBe("guest.unknown");
      expect(await assigned()).toEqual([]);

      value(
        await guests().assignGuestsToEvent(ADMIN, {
          eventId: event.id,
          guestIds: [guest.id, guest.id],
        })
      );
      expect(await assigned()).toEqual([guest.id]);
      value(
        await guests().removeGuestsFromEvent(ADMIN, {
          eventId: event.id,
          guestIds: [guest.id],
        })
      );
      expect(await assigned()).toEqual([]);
    }
  );

  it(
    "imports a CSV into events, reporting every bad row and importing nothing then",
    { tags: ["016-US2"] },
    async () => {
      const event = await createEvent();
      await createGuest({ email: "old@x.org" });

      const rejected = await guests().importGuests(ADMIN, {
        csv: "name,email\n,a@x.org\nBo,nope",
        eventIds: [event.id],
      });
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
          await guests().importGuests(ADMIN, {
            csv: "name,email\nAda,ada@x.org",
            eventIds: ["nope"],
          })
        )
      ).toBe("event.notFound");
      expect(await getRepositories().guests.listFull()).toHaveLength(1);

      expect(
        value(
          await guests().importGuests(ADMIN, {
            csv: "name,email\nAda,ada@x.org\nOld,OLD@x.org",
            eventIds: [event.id, event.id],
          })
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
      expect(maps.save).not.toHaveBeenCalled();

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
        mapImageUrl: "/media/site/map.png?v=1",
      });
      expect(maps.save).toHaveBeenCalledWith(Buffer.from([1]), "png");

      const removed = value(
        await site().updateSiteSettings(ADMIN, {
          title: "Camp",
          description: "",
          removeMap: true,
        })
      );
      expect(removed.mapImageUrl).toBe("");
      expect(maps.delete).toHaveBeenCalledOnce();
      expect(value(await site().getSiteSettings(ADMIN))).toEqual(removed);
    }
  );
});
