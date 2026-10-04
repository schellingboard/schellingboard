import fs from "fs";
import os from "os";
import path from "path";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { DEFAULT_EMAIL_SETTINGS } from "@schellingboard/domain/guest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import { createImageFile } from "../helpers/utils";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const HANDLERS = { GET, POST, PUT, DELETE } as const;

function call(
  method: keyof typeof HANDLERS,
  urlPath: string,
  {
    body,
    form,
    cookie,
    key,
  }: { body?: unknown; form?: FormData; cookie?: string; key?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  if (key) headers["idempotency-key"] = key;
  return HANDLERS[method](
    new NextRequest(`http://test/api/v1${urlPath}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    })
  );
}

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

async function avatarForm(size: number) {
  const form = new FormData();
  form.set("avatar", await createImageFile(size, size, "me.png"));
  return form;
}

const DEVICE = {
  endpoint: "https://push.example/this-phone",
  p256dh:
    "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
  auth: "tBHItJI5svbpez7KI4CCXg",
};

let uploadsDir: string;

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-test-"));
  vi.stubEnv("SB_UPLOADS_DIR", uploadsDir);
});
afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(uploadsDir, { recursive: true, force: true });
});

describe("/api/v1 profiles", () => {
  it(
    "serves a public profile without the email, and 404s an unknown guest",
    { tags: ["011-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada", email: "ada@example.com" });

      const res = await call("GET", `/guests/${ada.id}`);
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(JSON.parse(text)).toMatchObject({
        id: ada.id,
        name: "Ada",
        avatarUrl: null,
        profileUpdatedAt: null,
      });
      expect(text).not.toContain("ada@example.com");
      expect(text).not.toContain("emailSettings");

      const missing = await call("GET", "/guests/nope");
      expect(missing.status).toBe(404);
      expect(await missing.json()).toMatchObject({ code: "profile.notFound" });
    }
  );

  it(
    "saves the caller's profile, and refuses nobody as a problem",
    { tags: ["011-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      const profile = { name: "Ada L.", languages: ["English", ""] };

      const saved = await call("PUT", "/me/profile", {
        cookie: asGuest(ada.id),
        body: profile,
      });
      expect(saved.status).toBe(200);
      expect(await saved.json()).toMatchObject({
        name: "Ada L.",
        languages: ["English"],
      });

      const refused = await call("PUT", "/me/profile", { body: profile });
      expect(refused.status).toBe(403);
      expect(refused.headers.get("content-type")).toBe(
        "application/problem+json"
      );
      expect(await refused.json()).toMatchObject({ code: "guest.unselected" });
    }
  );

  it(
    "uploads a photo as multipart, replays a byte-identical retry, and removes it",
    { tags: ["011-US2", "019-US2"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      const form = await avatarForm(256);
      // The same Request body bytes, boundary included, for both attempts.
      const encoded = new Response(form);
      const contentType = encoded.headers.get("content-type")!;
      const raw = await encoded.arrayBuffer();
      const upload = () =>
        PUT(
          new NextRequest("http://test/api/v1/me/avatar", {
            method: "PUT",
            headers: {
              cookie: asGuest(ada.id),
              "idempotency-key": "photo-1",
              "content-type": contentType,
            },
            body: raw,
          })
        );

      const uploaded = await upload();
      expect(uploaded.status).toBe(200);
      const body = (await uploaded.json()) as { avatarUrl: string };
      expect(body.avatarUrl).toMatch(/^\/media\/avatars\/.+\.png\?v=\d+$/);
      expect(await (await upload()).json()).toEqual(body);

      const removed = await call("DELETE", "/me/avatar", {
        cookie: asGuest(ada.id),
      });
      expect(removed.status).toBe(204);
      expect(
        (await getRepositories().guests.findById(ada.id))?.avatarUrl ?? null
      ).toBeNull();
    }
  );

  it(
    "answers an unusable photo with avatar.invalid, and an unparsable body with request.invalid",
    { tags: ["011-US2"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });

      const res = await call("PUT", "/me/avatar", {
        cookie: asGuest(ada.id),
        form: await avatarForm(64),
      });
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ code: "avatar.invalid" });

      const garbled = await PUT(
        new NextRequest("http://test/api/v1/me/avatar", {
          method: "PUT",
          headers: {
            cookie: asGuest(ada.id),
            "content-type": "multipart/form-data; boundary=x",
          },
          body: "not multipart",
        })
      );
      expect(garbled.status).toBe(400);
      expect(await garbled.json()).toMatchObject({ code: "request.invalid" });
    }
  );
});

describe("/api/v1 notifications and settings", () => {
  it(
    "lists, reads and deletes the caller's notifications",
    { tags: ["013-US1", "013-US2"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();
      const repo = getRepositories().notifications;
      const mine = await repo.create({
        guestId: ada.id,
        type: "sessionComment",
        text: "Anna commented on your session",
        url: "/e?viewSession=s1",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
      });
      const theirs = await repo.create({
        guestId: grace.id,
        type: "sessionComment",
        text: "Not Ada's",
        url: "/e",
        createdAt: new Date(),
      });

      const listed = await call("GET", "/me/notifications", {
        cookie: asGuest(ada.id),
      });
      expect(listed.status).toBe(200);
      expect(await listed.json()).toEqual({
        notifications: [
          {
            id: mine.id,
            type: "sessionComment",
            text: "Anna commented on your session",
            url: "/e?viewSession=s1",
            createdAt: "2026-01-01T10:00:00.000Z",
            readAt: null,
          },
        ],
        unreadCount: 1,
        total: 1,
      });

      const read = await call("POST", `/me/notifications/${mine.id}/read`, {
        cookie: asGuest(ada.id),
      });
      expect(read.status).toBe(200);
      const readBody = (await read.json()) as { readAt: string | null };
      expect(readBody.readAt).not.toBeNull();
      const foreign = await call(
        "POST",
        `/me/notifications/${theirs.id}/read`,
        { cookie: asGuest(ada.id) }
      );
      expect(foreign.status).toBe(404);

      const deleted = await call("POST", "/me/notifications/delete", {
        cookie: asGuest(ada.id),
        body: { ids: [mine.id, theirs.id] },
      });
      expect(deleted.status).toBe(204);
      expect(await repo.countByGuest(ada.id)).toBe(0);
      expect(await repo.countByGuest(grace.id)).toBe(1);
    }
  );

  it(
    "reads and replaces the caller's email settings, refusing a partial set",
    { tags: ["013-US5"] },
    async () => {
      const ada = await createGuest();
      const cookie = asGuest(ada.id);

      const partial = await call("PUT", "/me/email-settings", {
        cookie,
        body: { rsvpChange: false },
      });
      expect(partial.status).toBe(400);
      expect(await partial.json()).toMatchObject({ code: "request.invalid" });

      const changed = { ...DEFAULT_EMAIL_SETTINGS, rsvpChange: false };
      const put = await call("PUT", "/me/email-settings", {
        cookie,
        body: changed,
      });
      expect(put.status).toBe(204);
      const got = await call("GET", "/me/email-settings", { cookie });
      expect(await got.json()).toEqual(changed);
    }
  );

  it(
    "takes a push subscription without ever sending it back",
    { tags: ["013-US3"] },
    async () => {
      const ada = await createGuest();
      const grace = await createGuest();

      const subscribed = await call("POST", "/me/push-subscriptions", {
        cookie: asGuest(ada.id),
        body: DEVICE,
      });
      expect(subscribed.status).toBe(204);
      expect(await subscribed.text()).toBe("");

      const check = (id: string) =>
        call("POST", "/me/push-subscriptions/check", {
          cookie: asGuest(id),
          body: { endpoint: DEVICE.endpoint },
        });
      expect(await (await check(ada.id)).json()).toEqual({ enabled: true });
      expect(await (await check(grace.id)).json()).toEqual({ enabled: false });

      const notHttps = await call("POST", "/me/push-subscriptions", {
        cookie: asGuest(ada.id),
        body: { ...DEVICE, endpoint: "http://push.example/x" },
      });
      expect(notHttps.status).toBe(400);

      const removed = await call("POST", "/me/push-subscriptions/remove", {
        cookie: asGuest(ada.id),
        body: { endpoint: DEVICE.endpoint },
      });
      expect(removed.status).toBe(204);
      expect(await (await check(ada.id)).json()).toEqual({ enabled: false });
    }
  );
});

describe("/api/v1 attendee count", () => {
  it(
    "records a host's count and refuses a stranger before checking the value",
    { tags: ["001-US1"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const host = await createGuest({ eventId: event.id });
      const stranger = await createGuest({ eventId: event.id });
      const session = await createSession(event.id, {
        hostIds: [host.id],
        startTime: new Date(Date.now() - 3 * 3600_000),
        endTime: new Date(Date.now() - 3600_000),
      });
      const put = (id: string, count: unknown) =>
        call("PUT", `/sessions/${session.id}/attendee-count`, {
          cookie: asGuest(id),
          body: { count },
        });

      const recorded = await put(host.id, 12);
      expect(recorded.status).toBe(200);
      expect(await recorded.json()).toEqual({ count: 12 });

      const outOfRange = await put(host.id, 5000);
      expect(outOfRange.status).toBe(400);
      expect(await outOfRange.json()).toMatchObject({
        code: "attendeeCount.invalid",
      });

      const probe = await put(stranger.id, 5000);
      expect(probe.status).toBe(403);
      expect(await probe.json()).toMatchObject({
        code: "attendeeCount.notHost",
      });

      const read = await call("GET", `/sessions/${session.id}/attendee-count`, {
        cookie: asGuest(host.id),
      });
      expect(await read.json()).toEqual({ count: 12 });
    }
  );
});
