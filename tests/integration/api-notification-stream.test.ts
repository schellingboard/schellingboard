// @module-tag 013-US1
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getRepositories } from "@/db/container";
import type { EmailRecipe } from "@/emails/registry";
import { credentialsChanged } from "@/server/kernel/credential-changes";
import { GET, POST } from "@/tests/helpers/v1-route";
import { notifyGuest } from "@/utils/notifications";

import { resetTestDb, setupTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

const RECIPE: EmailRecipe = {
  template: "sessionDeleted",
  props: {
    recipient: "attendee",
    title: "Workshop",
    time: "10:00 - 01 Jun",
    location: "Room A",
    eventUrl: "https://site.example/e",
  },
};
const notice = (message: string) => ({
  notice: { id: "added", message },
  url: "/e",
  at: new Date("2026-06-01T10:00:00.000Z"),
});

const cookieOf = (guestId: string) =>
  `${GUEST_COOKIE_NAME}=${openGuestValue(guestId)}`;

function open(guestId?: string) {
  return GET(
    new Request("http://test/api/v1/me/notifications/stream", {
      headers: guestId ? { cookie: cookieOf(guestId) } : {},
    })
  );
}

function reader(res: Response) {
  const r = res.body!.getReader();
  const decoder = new TextDecoder();
  return {
    async nextUnread(): Promise<number> {
      for (;;) {
        const { value, done } = await r.read();
        if (done) throw new Error("stream ended");
        const text = decoder.decode(value);
        const match = /event: unread\ndata: (\{.*\})/.exec(text);
        if (match)
          return (JSON.parse(match[1]) as { unreadCount: number }).unreadCount;
      }
    },
    ended: async () => (await r.read()).done,
    cancel: () => r.cancel(),
  };
}

describe("GET /me/notifications/stream", () => {
  it("opens with the unread count", async () => {
    const guest = await createGuest();
    await notifyGuest(guest.id, "rsvpChange", RECIPE, notice("One"));

    const stream = reader(await open(guest.id));

    expect(await stream.nextUnread()).toBe(1);
    await stream.cancel();
  });

  it("sends the new count when a notification arrives", async () => {
    const guest = await createGuest();
    const stream = reader(await open(guest.id));
    expect(await stream.nextUnread()).toBe(0);

    await notifyGuest(guest.id, "rsvpChange", RECIPE, notice("Two"));

    expect(await stream.nextUnread()).toBe(1);
    await stream.cancel();
  });

  it("sends the new count when one is read elsewhere", async () => {
    const guest = await createGuest();
    await notifyGuest(guest.id, "rsvpChange", RECIPE, notice("Three"));
    const stream = reader(await open(guest.id));
    expect(await stream.nextUnread()).toBe(1);
    const [only] = await getRepositories().notifications.listByGuest(guest.id);

    const res = await POST(
      new Request("http://test/api/v1/me/notifications/read", {
        method: "POST",
        headers: {
          cookie: cookieOf(guest.id),
          "content-type": "application/json",
          "idempotency-key": "k1",
        },
        body: JSON.stringify({ ids: [only.id] }),
      })
    );
    expect(res.status).toBe(204);

    expect(await stream.nextUnread()).toBe(0);
    await stream.cancel();
  });

  it("does not tell one guest about another's notifications", async () => {
    const [mia, kai] = [await createGuest(), await createGuest()];
    const stream = reader(await open(mia.id));
    expect(await stream.nextUnread()).toBe(0);

    await notifyGuest(kai.id, "rsvpChange", RECIPE, notice("For Kai"));
    await notifyGuest(mia.id, "rsvpChange", RECIPE, notice("For Mia"));

    expect(await stream.nextUnread()).toBe(1);
    await stream.cancel();
  });

  it("ends when the guest's login changes", async () => {
    const guest = await createGuest();
    const stream = reader(await open(guest.id));
    expect(await stream.nextUnread()).toBe(0);

    credentialsChanged(guest.id);

    expect(await stream.ended()).toBe(true);
  });

  it("refuses a visitor with no name", async () => {
    const res = await open();

    expect(res.status).toBe(403);
  });
});
