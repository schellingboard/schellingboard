import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

// Guards the invariant in docs/dev/coding-guidelines.md § Authorization: every mutating
// handler must resolve the acting guest and refuse to act as a protected
// guest without a verified session. This file enumerates the /api routes
// the web app mounts so a newly added, unguarded handler fails the suite
// instead of silently shipping — it must be added to VERIFIERS (with a check
// that proves the 403).

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

const cookieJar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => {
        const value = cookieJar.get(name);
        return value === undefined ? undefined : { name, value };
      },
    }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { siteAuthenticate } from "../helpers/site-auth";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  slotStart,
} from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import { getRepositories } from "@/db/container";
import { api } from "@/server/http/app";
import { web } from "@/server/http/web";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

async function protectGuest(guestId: string): Promise<void> {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE", "ALL"]);

function mutatingApiRoutes(): string[] {
  return [
    ...new Set(
      web.routes
        .filter((r) => r.path.startsWith("/api/") && MUTATING.has(r.method))
        .map((r) => `${r.method} ${r.path}`)
    ),
  ].sort();
}

// Signing out acts on the caller's own session, not on a named guest.
const OUT_OF_SCOPE = new Set(["POST /api/auth/logout"]);

type Verifier = () => Promise<void>;

const VERIFIERS: Record<string, Verifier> = {
  "ALL /api/v1/*": async () => {
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest({ eventId: event.id });
    await protectGuest(guest.id);
    const location = await createLocation({ eventId: event.id });
    const day = await createDay(event.id);
    const res = await api.fetch(
      new Request("http://test/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({
          dayId: day.id,
          title: "T",
          description: "",
          closed: false,
          hostIds: [guest.id],
          locationId: location.id,
          startTime: slotStart(day, 60),
          durationMinutes: 60,
        }),
        headers: {
          "content-type": "application/json",
          cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(guest.id)}`,
        },
      })
    );
    expect(res.status).toBe(403);
  },
};

describe("mutating-surface regression guard", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });
  afterEach(() => vi.unstubAllEnvs());

  for (const route of mutatingApiRoutes().filter((r) => !OUT_OF_SCOPE.has(r))) {
    it(`${route} is guarded`, () => {
      expect(
        route in VERIFIERS,
        `${route} is not in VERIFIERS in ` +
          `tests/integration/mutating-surface-guard.test.ts — add it`
      ).toBe(true);
    });
  }

  for (const [name, verify] of Object.entries(VERIFIERS)) {
    it(
      `${name} rejects acting as a protected guest without a verified session`,
      verify
    );
  }
});
