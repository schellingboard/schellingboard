import { render } from "@react-email/render";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST, PUT } from "@/tests/helpers/v1-route";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
  isMailerConfigured: vi.fn(() => true),
}));

import { getRepositories } from "@/db/container";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { hashUserPassword } from "@/utils/user-credentials";

import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { resetTestDb, setupTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "../helpers/guest-cookie";

const HOUR = 60 * 60 * 1000;
const NEW_PASSWORD = "a brand new password";

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

const cookieOf = (res: Response) =>
  (res.headers.get("set-cookie") ?? "").split(";")[0];

async function linkFor(guestId: string): Promise<string> {
  const res = await call("POST", `/admin/guests/${guestId}/password-link`);
  expect(res.status).toBe(201);
  return ((await res.json()) as { token: string }).token;
}

const spend = (guestId: string, token: string) =>
  call(
    "POST",
    "/auth/reset",
    { guestId, token, newPassword: NEW_PASSWORD },
    ""
  );

const logIn = (guestId: string, credential: string) =>
  call("POST", "/auth/login", { guestId, credential }, "");

const makeAdmin = (guestId: string, resetPassword?: boolean) =>
  call("PUT", `/admin/guests/${guestId}/site-admin`, {
    siteAdmin: true,
    resetPassword,
  });

async function withPassword(email: string | null = null) {
  const guest = await createGuest({ email });
  await getRepositories().guests.setAuthProtection(guest.id, {
    authProtected: true,
    passwordHash: await hashUserPassword("an old password"),
  });
  return guest;
}

const resetCode = (guestId: string, afterMs: number) =>
  getRepositories().authCodes.findActive(
    guestId,
    "reset",
    new Date(Date.now() + afterMs)
  );

beforeAll(() => setupTestDb());
beforeEach(async () => {
  resetTestDb();
  vi.mocked(sendMail).mockReset();
  vi.mocked(isMailerConfigured).mockReturnValue(true);
  vi.stubEnv("SITE_URL", "https://sessions.test.example");
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
});

describe("a password link from an admin", { tags: ["016-US6"] }, () => {
  it("lets a new site admin without email sign in and administer", async () => {
    vi.mocked(isMailerConfigured).mockReturnValue(false);
    const alice = await createGuest({ email: null });
    expect((await makeAdmin(alice.id)).status).toBe(200);

    const set = await spend(alice.id, await linkFor(alice.id));

    expect(set.status).toBe(204);
    expect(set.headers.get("set-cookie")).toBeNull();
    const login = await logIn(alice.id, NEW_PASSWORD);
    const res = await call("GET", "/admin/guests", undefined, cookieOf(login));
    expect(res.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("replaces a forgotten password, once", async () => {
    const guest = await withPassword();
    const token = await linkFor(guest.id);

    expect((await spend(guest.id, token)).status).toBe(204);
    expect((await logIn(guest.id, NEW_PASSWORD)).status).toBe(200);
    const again = await spend(guest.id, token);
    expect(again.status).toBe(403);
    expect(await again.json()).toMatchObject({
      detail: "This link no longer works. Request a new one, or ask an admin.",
    });
  });

  it("works for 24 hours", async () => {
    const guest = await createGuest();
    await linkFor(guest.id);

    expect(await resetCode(guest.id, 23 * HOUR)).not.toBeNull();
    expect(await resetCode(guest.id, 25 * HOUR)).toBeNull();
  });

  it("ends the previous link", async () => {
    const guest = await createGuest();
    const first = await linkFor(guest.id);
    const second = await linkFor(guest.id);

    expect((await spend(guest.id, first)).status).toBe(403);
    expect((await spend(guest.id, second)).status).toBe(204);
  });

  it("is for admins, and for a user who exists", async () => {
    const guest = await createGuest();

    const stranger = await call(
      "POST",
      `/admin/guests/${guest.id}/password-link`,
      undefined,
      `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(guest.id)}`
    );
    const unknown = await call("POST", "/admin/guests/nobody/password-link");

    expect(stranger.status).toBe(403);
    expect(unknown.status).toBe(404);
  });

  it("is never answered again from the idempotency store", async () => {
    const guest = await createGuest();
    const ask = async () => {
      const res = await POST(
        new Request(
          `http://test/api/v1/admin/guests/${guest.id}/password-link`,
          {
            method: "POST",
            headers: { cookie: admin, "idempotency-key": "same" },
          }
        )
      );
      return ((await res.json()) as { token: string }).token;
    };

    expect(await ask()).not.toBe(await ask());
  });

  it("comes by email, valid for 24 hours", async () => {
    const guest = await createGuest({ email: "alice@example.org" });

    const res = await call(
      "POST",
      `/admin/guests/${guest.id}/password-link/mail`
    );

    expect(res.status).toBe(204);
    const [[mail]] = vi.mocked(sendMail).mock.calls;
    expect(mail.to).toBe("alice@example.org");
    const html = await render(mail.body);
    expect(html).toContain("24 hours");
    const token = decodeURIComponent(html.match(/token=([^"&]+)/)![1]);
    expect((await spend(guest.id, token)).status).toBe(204);
  });

  it.each([
    ["the user has no email", null, true, "guest.noEmail"],
    ["the site sends no mail", "a@x.org", false, "auth.mailUnavailable"],
  ])("is not mailed when %s", async (_, email, configured, code) => {
    vi.mocked(isMailerConfigured).mockReturnValue(configured);
    const guest = await createGuest({ email });

    const res = await call(
      "POST",
      `/admin/guests/${guest.id}/password-link/mail`
    );

    expect(await res.json()).toMatchObject({ code });
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("resetting the password of a new site admin", () => {
  it(
    "ends the password, the sessions and the emailed tokens",
    { tags: ["016-US6"] },
    async () => {
      const guest = await withPassword("alice@example.org");
      const session = `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(guest.id)}`;
      await call("POST", "/auth/login-code", { guestId: guest.id }, "");
      await linkFor(guest.id);

      const res = await makeAdmin(guest.id, true);

      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({
        siteAdmin: true,
        hasPassword: false,
        authProtected: true,
      });
      expect((await logIn(guest.id, "an old password")).status).toBe(403);
      const old = await call("GET", "/admin/guests", undefined, session);
      expect(old.status).not.toBe(200);
      const { authCodes, loginSessions } = getRepositories();
      expect(await loginSessions.listForGuest(guest.id)).toEqual([]);
      for (const purpose of ["login", "reset"] as const)
        expect(
          await authCodes.findActive(guest.id, purpose, new Date())
        ).toBeNull();
    }
  );

  it("happens only when asked for", { tags: ["016-US4"] }, async () => {
    const guest = await withPassword();

    const res = await makeAdmin(guest.id);

    expect(await res.json()).toMatchObject({ hasPassword: true });
    expect((await logIn(guest.id, "an old password")).status).toBe(200);
  });

  it(
    "never happens to someone already a site admin",
    { tags: ["016-US4"] },
    async () => {
      const guest = await withPassword();
      await getRepositories().guests.setSiteAdmin(guest.id, true);

      const res = await makeAdmin(guest.id, true);

      expect(await res.json()).toMatchObject({ hasPassword: true });
      expect((await logIn(guest.id, "an old password")).status).toBe(200);
    }
  );
});
