import { describe, it, expect, beforeAll, beforeEach } from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { createNotificationUseCases } from "@/server/modules/notifications/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import { DEFAULT_EMAIL_SETTINGS } from "@schellingboard/domain/guest";

const NOBODY: Actor = { admin: false, guest: null };
const ADMIN: Actor = { admin: true, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const now = () => new Date();

const notifications = () =>
  createNotificationUseCases({ repos: getRepositories() });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}

const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

async function notify(guestId: string, text = "Anna commented", at = now()) {
  return getRepositories().notifications.create({
    guestId,
    type: "sessionComment",
    text,
    url: "/e?viewSession=s1",
    createdAt: at,
  });
}

const DEVICE = {
  endpoint: "https://push.example/this-phone",
  p256dh:
    "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
  auth: "tBHItJI5svbpez7KI4CCXg",
};

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("reading one's own notifications", () => {
  it(
    "lists only the acting guest's, newest first, with the unread count",
    { tags: ["013-US1"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const older = await notify(ada.id, "older", new Date(Date.now() - 1000));
      const newer = await notify(ada.id, "newer");
      await notify(grace.id, "not Ada's");
      await getRepositories().notifications.markRead(ada.id, older.id, now());

      const listed = value(
        await notifications().listMyNotifications(open(ada.id), { limit: 20 })
      );

      expect(listed.notifications.map((n) => n.text)).toEqual([
        "newer",
        "older",
      ]);
      expect(listed.notifications[0]).toMatchObject({
        id: newer.id,
        url: "/e?viewSession=s1",
      });
      expect(listed.unreadCount).toBe(1);
      expect(listed.total).toBe(2);
    }
  );

  it(
    "returns at most `limit` notifications",
    { tags: ["013-US1"] },
    async () => {
      const ada = await createGuest();
      await notify(ada.id, "a");
      await notify(ada.id, "b");

      const listed = value(
        await notifications().listMyNotifications(open(ada.id), { limit: 1 })
      );
      expect(listed.notifications).toHaveLength(1);
      expect(listed.total).toBe(2);
    }
  );

  it(
    "refuses nobody, an admin without a guest, and a protected guest's open cookie",
    { tags: ["013-US1"] },
    async () => {
      const ada = await createGuest();
      await protect(ada.id);
      const list = (actor: Actor) =>
        notifications().listMyNotifications(actor, { limit: 20 });

      expect(code(await list(NOBODY))).toBe("guest.unselected");
      expect(code(await list(ADMIN))).toBe("guest.unselected");
      expect(code(await list(open(ada.id)))).toBe("guest.protected");
    }
  );
});

describe("marking and deleting notifications", () => {
  it(
    "marks the acting guest's own read and skips someone else's",
    { tags: ["013-US2"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const mine = await notify(ada.id);
      const theirs = await notify(grace.id);

      value(
        await notifications().markNotificationsRead(
          open(ada.id),
          { ids: [mine.id, theirs.id] },
          now()
        )
      );

      const repo = getRepositories().notifications;
      expect((await repo.findForGuest(ada.id, mine.id))?.readAt).toBeDefined();
      expect(
        (await repo.findForGuest(grace.id, theirs.id))?.readAt
      ).toBeUndefined();
    }
  );

  it(
    "deletes the acting guest's own and skips someone else's",
    { tags: ["013-US2"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const mine = await notify(ada.id);
      const theirs = await notify(grace.id);

      value(
        await notifications().deleteNotifications(open(ada.id), {
          ids: [mine.id, theirs.id],
        })
      );

      const repo = getRepositories().notifications;
      expect(await repo.findForGuest(ada.id, mine.id)).toBeUndefined();
      expect(await repo.findForGuest(grace.id, theirs.id)).toBeDefined();
    }
  );

  it(
    "reads one notification and says where it points; another guest's is not found",
    { tags: ["013-US2"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const mine = await notify(ada.id);
      const theirs = await notify(grace.id);

      const read = value(
        await notifications().readNotification(
          open(ada.id),
          { id: mine.id },
          now()
        )
      );
      expect(read).toMatchObject({ id: mine.id, url: "/e?viewSession=s1" });
      expect(read.readAt).toBeInstanceOf(Date);

      expect(
        code(
          await notifications().readNotification(
            open(ada.id),
            { id: theirs.id },
            now()
          )
        )
      ).toBe("notification.notFound");
      expect(
        (
          await getRepositories().notifications.findForGuest(
            grace.id,
            theirs.id
          )
        )?.readAt
      ).toBeUndefined();
    }
  );
});

describe("email settings", () => {
  it(
    "reads and replaces only the acting guest's settings",
    { tags: ["013-US5"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const changed = { ...DEFAULT_EMAIL_SETTINGS, rsvpChange: false };

      expect(
        value(await notifications().getMyEmailSettings(open(ada.id)))
      ).toEqual(DEFAULT_EMAIL_SETTINGS);
      value(await notifications().updateMyEmailSettings(open(ada.id), changed));

      expect(
        value(await notifications().getMyEmailSettings(open(ada.id)))
      ).toEqual(changed);
      expect(
        value(await notifications().getMyEmailSettings(open(grace.id)))
      ).toEqual(DEFAULT_EMAIL_SETTINGS);
    }
  );

  it(
    "refuses a protected guest's open cookie",
    { tags: ["013-US5"] },
    async () => {
      const ada = await createGuest();
      await protect(ada.id);
      expect(code(await notifications().getMyEmailSettings(open(ada.id)))).toBe(
        "guest.protected"
      );
      expect(
        code(
          await notifications().updateMyEmailSettings(
            open(ada.id),
            DEFAULT_EMAIL_SETTINGS
          )
        )
      ).toBe("guest.protected");
    }
  );
});

describe("push devices", () => {
  it(
    "remembers a device for the acting guest, tells whether it is theirs, and forgets it",
    { tags: ["013-US3"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const enabled = async (actor: Actor) =>
        value(
          await notifications().isPushEnabledHere(actor, {
            endpoint: DEVICE.endpoint,
          })
        );

      value(await notifications().subscribeToPush(open(ada.id), DEVICE, now()));
      expect(await enabled(open(ada.id))).toBe(true);
      expect(await enabled(open(grace.id))).toBe(false);

      value(
        await notifications().unsubscribeFromPush(open(ada.id), {
          endpoint: DEVICE.endpoint,
        })
      );
      expect(await enabled(open(ada.id))).toBe(false);
    }
  );

  it(
    "will not forget a device belonging to someone else, yet reports success",
    { tags: ["013-US3"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      value(await notifications().subscribeToPush(open(ada.id), DEVICE, now()));

      expect(
        code(
          await notifications().unsubscribeFromPush(open(grace.id), {
            endpoint: DEVICE.endpoint,
          })
        )
      ).toBe("ok");
      expect(
        await getRepositories().push.listSubscriptions(ada.id)
      ).toHaveLength(1);
    }
  );

  it("refuses nobody", { tags: ["013-US3"] }, async () => {
    expect(
      code(await notifications().subscribeToPush(NOBODY, DEVICE, now()))
    ).toBe("guest.unselected");
  });
});
