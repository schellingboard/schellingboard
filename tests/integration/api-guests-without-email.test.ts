import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { GET, POST, PUT } from "@/tests/helpers/v1-route";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
  isMailerConfigured: vi.fn(() => true),
}));

import { getRepositories } from "@/db/container";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { hashUserPassword } from "@/utils/user-credentials";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { createEvent, createGuest } from "../helpers/factories";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

let admin = "";

const call = (
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown,
  cookie: string = admin
) =>
  ({ GET, POST, PUT })[method](
    new Request(`http://test/api/v1${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(cookie ? { cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

const asGuest = (value: string) => `${GUEST_COOKIE_NAME}=${value}`;

beforeAll(() => setupTestDb());
beforeEach(async () => {
  resetTestDb();
  vi.mocked(sendMail).mockReset();
  vi.mocked(isMailerConfigured).mockReturnValue(true);
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
});

describe("guests without an email", () => {
  it(
    "are created freely, even under one name, while an email stays unique",
    { tags: ["016-US1"] },
    async () => {
      const first = await call("POST", "/admin/guests", { name: "Ada" });
      const second = await call("POST", "/admin/guests", {
        name: "Ada",
        email: "",
      });
      expect(first.status).toBe(201);
      expect(second.status).toBe(201);
      expect(await first.json()).toMatchObject({ name: "Ada", email: null });
      expect(await second.json()).toMatchObject({ email: null });

      await call("POST", "/admin/guests", { name: "B", email: "b@x.org" });
      const again = await call("POST", "/admin/guests", {
        name: "C",
        email: "B@X.org",
      });
      expect(again.status).toBe(409);
      expect(await again.json()).toMatchObject({ code: "guest.emailTaken" });
    }
  );

  it(
    "gain and lose an email through an edit, and carry a unique username",
    { tags: ["016-US1"] },
    async () => {
      const made = (await (
        await call("POST", "/admin/guests", {
          name: "Ada",
          username: "ada",
        })
      ).json()) as { id: string; version: number; username: string };
      expect(made.username).toBe("ada");
      const other = await call("POST", "/admin/guests", {
        name: "Bo",
        username: "ada",
      });
      expect(other.status).toBe(409);
      expect(await other.json()).toMatchObject({ code: "username.taken" });

      const withEmail = await call("PUT", `/admin/guests/${made.id}`, {
        name: "Ada",
        email: "ada@x.org",
        expectedVersion: made.version,
      });
      expect(await withEmail.json()).toMatchObject({
        email: "ada@x.org",
        username: "ada",
      });
      const without = await call("PUT", `/admin/guests/${made.id}`, {
        name: "Ada",
        email: null,
        expectedVersion: made.version + 1,
      });
      expect(await without.json()).toMatchObject({ email: null });
    }
  );

  it(
    "are matched by exact name when an import row has no email",
    { tags: ["016-US2"] },
    async () => {
      const event = await createEvent();
      const csv = "name,email\nAda,\nBo,bo@x.org\nAda,";
      const import_ = () =>
        call("POST", "/admin/guests/import", { csv, eventIds: [event.id] });

      const first = await import_();
      expect(await first.json()).toEqual({ created: 2, existing: 1 });
      const second = await import_();
      expect(await second.json()).toEqual({ created: 0, existing: 3 });

      const guests = await getRepositories().guests.listByEvent(event.id);
      expect(guests.map((g) => g.name).sort()).toEqual(["Ada", "Bo"]);
    }
  );

  it(
    "get no mailed codes, links or test email, and are skipped by mailed join links",
    { tags: ["016-US5"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest({ email: null, eventId: event.id });

      for (const [path, body] of [
        ["/auth/login-code", { guestId: guest.id }],
        ["/auth/reset-link", { guestId: guest.id }],
        [`/admin/guests/${guest.id}/test-email`, undefined],
      ] as const) {
        const res = await call("POST", path, body);
        expect(res.status).toBe(409);
        expect(await res.json()).toMatchObject({ code: "guest.noEmail" });
      }

      const mailed = await call(
        "POST",
        `/admin/events/${event.id}/join-links/mail`
      );
      expect(await mailed.json()).toEqual({
        sent: 0,
        withoutEmail: 1,
        failed: 0,
      });
      expect(sendMail).not.toHaveBeenCalled();
    }
  );

  it(
    "may set a first password from a verified session, never from a claimed one",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: null });
      const password = { newPassword: "a long enough password" };

      const claimed = await call(
        "POST",
        "/me/credentials/password",
        password,
        asGuest(openGuestValue(guest.id))
      );
      expect(claimed.status).toBe(403);
      expect(await claimed.json()).toMatchObject({
        code: "auth.verificationRequired",
      });

      const verified = asGuest(await verifiedGuestValue(guest.id));
      const set = await call(
        "POST",
        "/me/credentials/password",
        password,
        verified
      );
      expect(set.status).toBe(204);
      const creds = await getRepositories().guests.getAuthCredentials(guest.id);
      expect(creds).toMatchObject({ authProtected: true });
      expect(creds?.passwordHash).toBeTruthy();
    }
  );

  it(
    "leave a password alone when the guest has an email to reset it with",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: "ada@x.org" });
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });
      const res = await call(
        "POST",
        "/me/credentials/password",
        { newPassword: "another long password" },
        asGuest(await verifiedGuestValue(guest.id))
      );
      expect(res.status).toBe(409);
      expect(await res.json()).toMatchObject({ code: "auth.passwordSet" });
    }
  );

  it(
    "may replace a forgotten password only from a join-link session, as no mail can reset it",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: null });
      const old = await hashUserPassword("hunter2 forever");
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: old,
      });
      const replace = async (via: "password" | "code" | "link") =>
        call(
          "POST",
          "/me/credentials/password",
          { newPassword: "another long password" },
          asGuest(await verifiedGuestValue(guest.id, via))
        );

      for (const via of ["password", "code"] as const) {
        const refused = await replace(via);
        expect(refused.status).toBe(409);
        expect(await refused.json()).toMatchObject({
          code: "auth.passwordSet",
        });
      }
      const res = await replace("link");
      expect(res.status).toBe(204);
      const creds = await getRepositories().guests.getAuthCredentials(guest.id);
      expect(creds?.passwordHash).not.toBe(old);
    }
  );

  it(
    "lets a guest back in with a fresh join link and set a new password",
    { tags: ["003-US6"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest({ email: null, eventId: event.id });
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });
      await new Promise((r) => setTimeout(r, 5));
      const { token } = (await (
        await call(
          "POST",
          `/admin/events/${event.id}/guests/${guest.id}/join-link`
        )
      ).json()) as { token: string };

      const joined = await call("POST", "/auth/join", { token }, "");
      const cookie = (joined.headers.get("set-cookie") ?? "").split(";")[0];
      const res = await call(
        "POST",
        "/me/credentials/password",
        { newPassword: "another long password" },
        cookie
      );

      expect(res.status).toBe(204);
    }
  );

  it(
    "never replaces the password of a site admin from a join link",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: null });
      await getRepositories().guests.setSiteAdmin(guest.id, true);
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });
      const res = await call(
        "POST",
        "/me/credentials/password",
        { newPassword: "another long password" },
        asGuest(await verifiedGuestValue(guest.id, "link"))
      );
      expect(res.status).toBe(409);
    }
  );

  it(
    "replaces a password from a join link when the guest has an email but the site sends no mail",
    { tags: ["003-US3"] },
    async () => {
      vi.mocked(isMailerConfigured).mockReturnValue(false);
      const guest = await createGuest({ email: "ada@x.org" });
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });
      const res = await call(
        "POST",
        "/me/credentials/password",
        { newPassword: "another long password" },
        asGuest(await verifiedGuestValue(guest.id, "link"))
      );
      expect(res.status).toBe(204);
    }
  );

  it(
    "tell the security screen whether the guest has an email and may set a password",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: null });
      const read = async (cookie: string): Promise<unknown> =>
        (await call("GET", "/me/credentials", undefined, cookie)).json();
      expect(await read(asGuest(await verifiedGuestValue(guest.id)))).toEqual({
        authProtected: false,
        username: null,
        hasEmail: false,
        canSetPassword: true,
      });
      expect(await read(asGuest(openGuestValue(guest.id)))).toMatchObject({
        canSetPassword: false,
      });
    }
  );

  it(
    "show on the site whether mail can be sent",
    { tags: ["003-US3"] },
    async () => {
      expect(
        await (await call("GET", "/site", undefined, "")).json()
      ).toMatchObject({
        emailEnabled: true,
      });
      vi.mocked(isMailerConfigured).mockReturnValue(false);
      expect(
        await (await call("GET", "/site", undefined, "")).json()
      ).toMatchObject({
        emailEnabled: false,
      });
    }
  );
  it(
    "refuse a stale edit that changes only the username, and count it as a change",
    { tags: ["016-US1"] },
    async () => {
      const made = (await (
        await call("POST", "/admin/guests", { name: "Ada" })
      ).json()) as { id: string; version: number };
      const body = { name: "Ada", expectedVersion: made.version };

      const first = await call("PUT", `/admin/guests/${made.id}`, {
        ...body,
        username: "ada",
      });
      expect(first.status).toBe(200);
      expect(((await first.json()) as { version: number }).version).toBe(
        made.version + 1
      );

      const stale = await call("PUT", `/admin/guests/${made.id}`, {
        ...body,
        username: "ada2",
      });
      expect(stale.status).toBe(409);
      expect(await getRepositories().guests.getUsername(made.id)).toBe("ada");
    }
  );

  it("treat a blank username as none", { tags: ["016-US1"] }, async () => {
    const res = await call("POST", "/admin/guests", {
      name: "Ada",
      username: " ",
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ username: null });
  });

  it(
    "send a guest with an email a security mail when they set a first password",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: "ada@x.org" });
      const res = await call(
        "POST",
        "/me/credentials/password",
        { newPassword: "a long enough password" },
        asGuest(await verifiedGuestValue(guest.id))
      );
      expect(res.status).toBe(204);
      expect(sendMail).toHaveBeenCalledTimes(1);
    }
  );
});
