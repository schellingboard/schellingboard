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
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function choose(guestId: string | null, cookie?: string, key?: string) {
  return PUT(
    new NextRequest("http://test/api/v1/me/identity", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
        ...(key ? { "idempotency-key": key } : {}),
      },
      body: JSON.stringify({ guestId }),
    })
  );
}

const signOut = () =>
  DELETE(
    new NextRequest("http://test/api/v1/me/identity", { method: "DELETE" })
  );

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: "hash",
  });
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

const whoAmI = (cookie?: string) =>
  GET(
    new NextRequest("http://test/api/v1/me/identity", {
      headers: cookie ? { cookie } : {},
    })
  );

describe("/api/v1/me/identity", () => {
  it("tells who the browser acts as", { tags: ["003-US1"] }, async () => {
    const ada = await createGuest({ name: "Ada" });

    const res = await whoAmI(`${GUEST_COOKIE_NAME}=${openGuestValue(ada.id)}`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ guestId: ada.id });
  });

  it("tells nobody when no name is chosen", { tags: ["003-US1"] }, async () => {
    expect(await (await whoAmI()).json()).toEqual({ guestId: null });
  });

  it(
    "does not tell a protected name that was not verified",
    { tags: ["003-US4"] },
    async () => {
      const grace = await createGuest({ name: "Grace" });
      await protect(grace.id);

      const open = await whoAmI(
        `${GUEST_COOKIE_NAME}=${openGuestValue(grace.id)}`
      );
      const verified = await whoAmI(
        `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(grace.id)}`
      );

      expect(await open.json()).toEqual({ guestId: null });
      expect(await verified.json()).toEqual({ guestId: grace.id });
    }
  );

  it("tells nobody for a deleted guest", { tags: ["003-US1"] }, async () => {
    expect(
      await (
        await whoAmI(`${GUEST_COOKIE_NAME}=${openGuestValue("gone")}`)
      ).json()
    ).toEqual({ guestId: null });
  });

  it(
    "picks an open name and sets the guest cookie",
    { tags: ["003-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });

      const res = await choose(ada.id);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ guestId: ada.id });
      expect(res.headers.get("set-cookie")).toContain(
        `${GUEST_COOKIE_NAME}=open.${ada.id}`
      );
    }
  );

  it("refuses an unknown name", { tags: ["003-US1"] }, async () => {
    const res = await choose("nobody");

    expect(res.status).toBe(404);
    expect(((await res.json()) as { code: string }).code).toBe(
      "guest.notFound"
    );
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it(
    "answers a protected name with a problem that sends the user to log in",
    { tags: ["003-US4"] },
    async () => {
      const grace = await createGuest({ name: "Grace" });
      await protect(grace.id);

      const res = await choose(
        grace.id,
        `${GUEST_COOKIE_NAME}=${openGuestValue(grace.id)}`
      );

      expect(res.status).toBe(403);
      expect(((await res.json()) as { code: string }).code).toBe(
        "guest.protected"
      );
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  );

  it(
    "keeps a protected name selected for its verified session",
    { tags: ["003-US4"] },
    async () => {
      const grace = await createGuest({ name: "Grace" });
      await protect(grace.id);

      const res = await choose(
        grace.id,
        `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(grace.id)}`
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ guestId: grace.id });
      expect(res.headers.get("set-cookie")).toContain(`${GUEST_COOKIE_NAME}=`);
      expect(res.headers.get("set-cookie")).not.toContain("open.");
    }
  );

  it("signs out by clearing the cookie", { tags: ["003-US2"] }, async () => {
    const res = await signOut();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ guestId: null });
    expect(res.headers.get("set-cookie")).toMatch(/guest=;.*Max-Age=0/i);
  });

  it(
    "sets the cookie again on a retry with the same key",
    { tags: ["003-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });

      await choose(ada.id, undefined, "k1");
      const retry = await choose(ada.id, undefined, "k1");

      expect(retry.status).toBe(200);
      expect(retry.headers.get("set-cookie")).toContain(`open.${ada.id}`);
    }
  );
});
