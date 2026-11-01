import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

const cookieJar = new Map<string, string>();

import { setupTestDb, resetTestDb } from "../helpers/db";
import { siteAuthenticate } from "../helpers/site-auth";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";
import { GET, PUT } from "@/tests/helpers/v1-route";
import { saveProfile } from "../helpers/profile-api";
import { callApi } from "../helpers/api";
import { DEFAULT_EMAIL_SETTINGS } from "@schellingboard/domain/guest";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

async function protectGuest(guestId: string): Promise<void> {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

async function authCookieHeader(guestId: string): Promise<string> {
  return `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(guestId)}`;
}

function v1(method: string, path: string, cookie?: string): Request {
  return new Request(`http://test/api/v1${path}`, {
    method,
    headers: cookie ? { cookie } : {},
  });
}

describe("write enforcement for protected guests", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });

  afterEach(() => vi.unstubAllEnvs());

  describe("PUT /api/v1/sessions/{id}/rsvps/{guestId}", () => {
    async function setup() {
      const event = await createEvent({ phase: "scheduling" });
      const guest = await createGuest({ eventId: event.id });
      const session = await createSession(event.id);
      await protectGuest(guest.id);
      return { guest, session };
    }

    it("rejects an RSVP for a protected guest without a verified session", async () => {
      const { guest, session } = await setup();
      const res = await PUT(
        v1("PUT", `/sessions/${session.id}/rsvps/${guest.id}`)
      );
      expect(res.status).toBe(403);
      expect(await getRepositories().rsvps.listByGuest(guest.id)).toHaveLength(
        0
      );
    });

    it("accepts an RSVP with a verified session", async () => {
      const { guest, session } = await setup();
      const res = await PUT(
        v1(
          "PUT",
          `/sessions/${session.id}/rsvps/${guest.id}`,
          await authCookieHeader(guest.id)
        )
      );
      expect(res.ok).toBe(true);
      expect(await getRepositories().rsvps.listByGuest(guest.id)).toHaveLength(
        1
      );
    });

    it("rejects a session verified for a different guest", async () => {
      const { guest, session } = await setup();
      const other = await createGuest();
      const res = await PUT(
        v1(
          "PUT",
          `/sessions/${session.id}/rsvps/${guest.id}`,
          await authCookieHeader(other.id)
        )
      );
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/guests/{id}/rsvps", () => {
    async function setup() {
      const event = await createEvent({ phase: "scheduling" });
      const guest = await createGuest({ eventId: event.id });
      const session = await createSession(event.id);
      await getRepositories().rsvps.create({
        sessionId: session.id,
        guestId: guest.id,
      });
      return { guest, session };
    }

    it("hides a protected guest's RSVPs from unverified readers", async () => {
      const { guest } = await setup();
      await protectGuest(guest.id);

      const unverified = await GET(v1("GET", `/guests/${guest.id}/rsvps`));
      expect(unverified.status).toBe(403);

      const verified = await GET(
        v1("GET", `/guests/${guest.id}/rsvps`, await authCookieHeader(guest.id))
      );
      expect(verified.ok).toBe(true);
      expect(
        ((await verified.json()) as { rsvps: unknown[] }).rsvps
      ).toHaveLength(1);
    });

    it("still lists RSVPs per session without auth", async () => {
      const { guest, session } = await setup();
      await protectGuest(guest.id);

      const res = await GET(v1("GET", `/sessions/${session.id}/rsvps`));
      expect(res.ok).toBe(true);
      expect(((await res.json()) as { rsvps: unknown[] }).rsvps).toHaveLength(
        1
      );
    });
  });

  describe("profile and settings edits", () => {
    it("rejects edits as a protected guest without a verified session", async () => {
      const guest = await createGuest({ name: "Before" });
      await protectGuest(guest.id);
      cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guest.id));

      const profileResult = await saveProfile(cookieJar, {
        expectedVersion: guest.profileVersion,
        name: "After",
        aboutMe: null,
      });
      expect(profileResult.ok).toBe(false);
      expect((await getRepositories().guests.findById(guest.id))?.name).toBe(
        "Before"
      );

      const settingsResult = await callApi(
        cookieJar,
        "PUT",
        "/me/email-settings",
        { ...DEFAULT_EMAIL_SETTINGS, rsvpChange: false }
      );
      expect(settingsResult).toMatchObject({
        error: { code: "guest.protected" },
      });
    });

    it("accepts edits with a verified session", async () => {
      const guest = await createGuest({ name: "Before" });
      await protectGuest(guest.id);
      cookieJar.set(GUEST_COOKIE_NAME, await verifiedGuestValue(guest.id));

      const result = await saveProfile(cookieJar, {
        expectedVersion: guest.profileVersion,
        name: "After",
        aboutMe: null,
      });
      expect(result).toEqual({ ok: true });
      expect((await getRepositories().guests.findById(guest.id))?.name).toBe(
        "After"
      );
    });
  });
});
