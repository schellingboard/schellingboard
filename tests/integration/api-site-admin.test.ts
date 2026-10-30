import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, POST, PUT } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { peopleUseCases } from "@/server/composition";
import { hashSessionToken } from "@/utils/login-session-token";
import { verifyUserPassword } from "@/utils/user-credentials";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const handlers = { GET, POST, PUT, DELETE };

const call = (
  method: keyof typeof handlers,
  path: string,
  body?: unknown,
  token?: string
) =>
  handlers[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { cookie: `${GUEST_COOKIE_NAME}=${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

const code = async (res: Response) =>
  ((await res.json()) as { code: string }).code;

async function siteAdmin() {
  const guest = await createGuest();
  await getRepositories().guests.setSiteAdmin(guest.id, true);
  return guest;
}

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("the site-admin role", () => {
  it(
    "gives admin rights to a verified session only",
    { tags: ["016-US4"] },
    async () => {
      const admin = await siteAdmin();

      const verified = await call(
        "GET",
        "/admin/guests",
        undefined,
        await verifiedGuestValue(admin.id)
      );
      const claimed = await call(
        "GET",
        "/admin/guests",
        undefined,
        openGuestValue(admin.id)
      );

      expect(verified.status).toBe(200);
      expect(claimed.status).toBe(403);
    }
  );

  it(
    "protects the name: it cannot be picked without a login",
    { tags: ["016-US4"] },
    async () => {
      const admin = await siteAdmin();

      const res = await call("PUT", "/me/identity", { guestId: admin.id });

      expect(res.status).toBe(403);
      expect(await code(res)).toBe("guest.protected");
    }
  );

  it("cannot be unprotected", { tags: ["016-US4"] }, async () => {
    const admin = await siteAdmin();
    const token = await verifiedGuestValue(admin.id);

    const res = await call(
      "POST",
      "/me/credentials/unprotect",
      { currentPassword: "whatever" },
      token
    );

    expect(res.status).toBe(403);
    expect(await code(res)).toBe("siteAdmin.protected");
  });
});

describe("PUT /api/v1/admin/guests/{id}/site-admin", () => {
  it(
    "grants and revokes the role for an admin",
    { tags: ["016-US4"] },
    async () => {
      const admin = await siteAdmin();
      const other = await createGuest();
      const token = await verifiedGuestValue(admin.id);

      const granted = await call(
        "PUT",
        `/admin/guests/${other.id}/site-admin`,
        { siteAdmin: true },
        token
      );
      expect(granted.status).toBe(200);
      expect(await granted.json()).toMatchObject({
        id: other.id,
        siteAdmin: true,
        authProtected: true,
      });

      const revoked = await call(
        "PUT",
        `/admin/guests/${other.id}/site-admin`,
        { siteAdmin: false },
        token
      );
      expect(revoked.status).toBe(200);
      expect(await revoked.json()).toMatchObject({ siteAdmin: false });
    }
  );

  it(
    "refuses to revoke the last site admin",
    { tags: ["016-US4"] },
    async () => {
      const admin = await siteAdmin();

      const res = await call(
        "PUT",
        `/admin/guests/${admin.id}/site-admin`,
        { siteAdmin: false },
        await verifiedGuestValue(admin.id)
      );

      expect(res.status).toBe(409);
      expect(await code(res)).toBe("siteAdmin.last");
      expect(await getRepositories().guests.getSiteAdmin(admin.id)).toBe(true);
    }
  );

  it(
    "does not count a password-less admin as having a password",
    { tags: ["016-US4"] },
    async () => {
      const admin = await siteAdmin();

      const res = await call(
        "GET",
        "/me/credentials",
        undefined,
        await verifiedGuestValue(admin.id)
      );

      expect(await res.json()).toMatchObject({ authProtected: false });
    }
  );

  it(
    "refuses to delete the last site admin",
    { tags: ["016-US4"] },
    async () => {
      const admin = await siteAdmin();

      const res = await call(
        "DELETE",
        `/admin/guests/${admin.id}`,
        undefined,
        await verifiedGuestValue(admin.id)
      );

      expect(res.status).toBe(409);
      expect(await code(res)).toBe("siteAdmin.last");
    }
  );

  it("refuses a visitor", { tags: ["016-US4"] }, async () => {
    const guest = await createGuest();

    const res = await call(
      "PUT",
      `/admin/guests/${guest.id}/site-admin`,
      { siteAdmin: true },
      await verifiedGuestValue(guest.id)
    );

    expect(res.status).toBe(403);
  });
});

describe("POST /api/v1/auth/bootstrap", () => {
  const issue = async () =>
    (await peopleUseCases().issueBootstrapToken()).token;

  it(
    "makes a new guest the site admin and signs them in",
    { tags: ["015-US6"] },
    async () => {
      const token = await issue();

      const res = await call("POST", "/auth/bootstrap", {
        token,
        name: "Ada",
        email: "ada@example.org",
        username: "ada",
        password: "correct horse",
      });

      expect(res.status).toBe(200);
      const guest =
        await getRepositories().guests.findByEmail("ada@example.org");
      expect(guest).toBeDefined();
      const { guests, loginSessions } = getRepositories();
      expect(await guests.getSiteAdmin(guest!.id)).toBe(true);
      expect(await guests.getUsername(guest!.id)).toBe("ada");
      const creds = await guests.getAuthCredentials(guest!.id);
      expect(
        await verifyUserPassword("correct horse", creds!.passwordHash)
      ).toBe(true);
      const cookie = (res.headers.get("set-cookie") ?? "")
        .split(";")[0]
        .split("=")[1];
      const row = await loginSessions.get(hashSessionToken(cookie));
      expect(row).toMatchObject({ guestId: guest!.id, assurance: "verified" });
    }
  );

  it(
    "makes an existing guest the site admin",
    { tags: ["015-US6"] },
    async () => {
      const guest = await createGuest();

      const res = await call("POST", "/auth/bootstrap", {
        token: await issue(),
        guestId: guest.id,
        username: "grace",
        password: "correct horse",
      });

      expect(res.status).toBe(200);
      expect(await getRepositories().guests.getSiteAdmin(guest.id)).toBe(true);
    }
  );

  it("works once, then the link is spent", { tags: ["015-US6"] }, async () => {
    const token = await issue();
    const body = {
      token,
      name: "Ada",
      email: "ada@example.org",
      username: "ada",
      password: "correct horse",
    };
    await call("POST", "/auth/bootstrap", body);

    const again = await call("POST", "/auth/bootstrap", {
      ...body,
      email: "eve@example.org",
      username: "eve",
    });

    expect(again.status).toBe(403);
    expect(await code(again)).toBe("bootstrap.tokenWrong");
  });

  it(
    "ends the earlier link when a new one is issued",
    { tags: ["015-US6"] },
    async () => {
      const first = await issue();
      await issue();

      const res = await call("POST", "/auth/bootstrap", {
        token: first,
        name: "Ada",
        email: "ada@example.org",
        username: "ada",
        password: "correct horse",
      });

      expect(res.status).toBe(403);
    }
  );

  it("refuses an expired link", { tags: ["015-US6"] }, async () => {
    await getRepositories().bootstrapTokens.replace({
      hash: hashSessionToken("old-token"),
      createdAt: new Date(Date.now() - 48 * 3600_000),
      expiresAt: new Date(Date.now() - 24 * 3600_000),
    });

    const res = await call("POST", "/auth/bootstrap", {
      token: "old-token",
      name: "Ada",
      email: "ada@example.org",
      username: "ada",
      password: "correct horse",
    });

    expect(res.status).toBe(403);
    expect(await code(res)).toBe("bootstrap.tokenWrong");
  });

  it(
    "keeps the link when the password is too weak",
    { tags: ["015-US6"] },
    async () => {
      const token = await issue();
      const body = {
        token,
        name: "Ada",
        email: "ada@example.org",
        username: "ada",
      };

      const weak = await call("POST", "/auth/bootstrap", {
        ...body,
        password: "short",
      });
      const retry = await call("POST", "/auth/bootstrap", {
        ...body,
        password: "correct horse",
      });

      expect(weak.status).toBe(400);
      expect(retry.status).toBe(200);
    }
  );
});

describe("the start-up announcement", () => {
  it(
    "issues a link only while no site admin exists",
    { tags: ["015-US6"] },
    async () => {
      expect(await peopleUseCases().announceBootstrap()).not.toBeNull();

      await siteAdmin();

      expect(await peopleUseCases().announceBootstrap()).toBeNull();
      expect(await peopleUseCases().announceBootstrap(true)).not.toBeNull();
    }
  );
});
