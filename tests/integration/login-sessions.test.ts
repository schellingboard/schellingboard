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
import { GET, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { hashSessionToken } from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, sessionGuestValue } from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

const asSession = (token: string) => `${GUEST_COOKIE_NAME}=${token}`;

const whoAmI = async (token: string) =>
  (await (
    await GET(
      new NextRequest("http://test/api/v1/me/identity", {
        headers: { cookie: asSession(token) },
      })
    )
  ).json()) as { guestId: string | null; awaitingLogin?: true };

function choose(guestId: string, token?: string) {
  return PUT(
    new NextRequest("http://test/api/v1/me/identity", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        ...(token ? { cookie: asSession(token) } : {}),
      },
      body: JSON.stringify({ guestId }),
    })
  );
}

const issuedToken = (res: Response) =>
  new RegExp(`${GUEST_COOKIE_NAME}=([^;]+)`).exec(
    res.headers.get("set-cookie") ?? ""
  )?.[1] ?? "";

const row = (token: string) =>
  getRepositories().loginSessions.findLive(hashSessionToken(token), realNow());

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: "hash",
  });
}

describe("login sessions", () => {
  it(
    "picking a name stores a claimed row, named by an opaque cookie",
    { tags: ["003-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });

      const res = await choose(ada.id);
      const token = issuedToken(res);

      expect(token).not.toContain(".");
      expect(token).not.toContain(ada.id);
      expect(await row(token)).toMatchObject({
        guestId: ada.id,
        assurance: "claimed",
      });
      expect(await whoAmI(token)).toEqual({ guestId: ada.id });
    }
  );

  it("a revoked row acts as nobody", { tags: ["003-US2"] }, async () => {
    const ada = await createGuest({ name: "Ada" });
    const token = await sessionGuestValue(ada.id, "claimed");
    expect(await whoAmI(token)).toEqual({ guestId: ada.id });

    await getRepositories().loginSessions.delete(hashSessionToken(token));

    expect(await whoAmI(token)).toEqual({ guestId: null });
  });

  it("an expired row acts as nobody", { tags: ["003-US1"] }, async () => {
    const ada = await createGuest({ name: "Ada" });
    const token = await sessionGuestValue(ada.id, "claimed", {
      expiresAt: new Date(realNow().getTime() - 1000),
    });

    expect(await whoAmI(token)).toEqual({ guestId: null });
  });

  it(
    "a claimed row cannot act as a protected guest; a verified one can",
    { tags: ["003-US4"] },
    async () => {
      const grace = await createGuest({ name: "Grace" });
      await protect(grace.id);

      expect(
        await whoAmI(await sessionGuestValue(grace.id, "claimed"))
      ).toEqual({ guestId: null, awaitingLogin: true });
      expect(
        await whoAmI(await sessionGuestValue(grace.id, "verified"))
      ).toEqual({ guestId: grace.id });
    }
  );

  it("signing out deletes the row", { tags: ["003-US2"] }, async () => {
    const ada = await createGuest({ name: "Ada" });
    const token = await sessionGuestValue(ada.id, "claimed");

    await DELETE(
      new NextRequest("http://test/api/v1/me/identity", {
        method: "DELETE",
        headers: { cookie: asSession(token) },
      })
    );

    expect(await row(token)).toBeNull();
  });

  it(
    "switching names issues a new id and drops the old row",
    { tags: ["003-US2"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      const bob = await createGuest({ name: "Bob" });
      const first = await sessionGuestValue(ada.id, "claimed");

      const second = issuedToken(await choose(bob.id, first));

      expect(second).not.toBe(first);
      expect(await row(first)).toBeNull();
      expect(await row(second)).toMatchObject({ guestId: bob.id });
    }
  );

  it(
    "keeping a protected name issues a new verified row",
    { tags: ["003-US4"] },
    async () => {
      const grace = await createGuest({ name: "Grace" });
      await protect(grace.id);
      const first = await sessionGuestValue(grace.id, "verified");

      const second = issuedToken(await choose(grace.id, first));

      expect(second).not.toBe(first);
      expect(await row(first)).toBeNull();
      expect(await row(second)).toMatchObject({ assurance: "verified" });
    }
  );

  it(
    "pruning drops expired rows and keeps live ones",
    { tags: ["003-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      const old = await sessionGuestValue(ada.id, "claimed", {
        expiresAt: new Date(realNow().getTime() - 1000),
      });
      const live = await sessionGuestValue(ada.id, "claimed");

      await getRepositories().loginSessions.deleteExpired(realNow());

      expect(
        await getRepositories().loginSessions.get(hashSessionToken(old))
      ).toBeNull();
      expect(await row(live)).not.toBeNull();
    }
  );
});
