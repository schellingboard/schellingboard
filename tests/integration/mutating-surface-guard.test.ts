import fs from "node:fs";
import path from "node:path";
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

// Guards the invariant in docs/dev/coding-guidelines.md § Authorization: every mutating
// handler must resolve the acting guest and refuse to act as a protected
// guest without a verified session. This file enumerates app/api route
// files so a newly added, unguarded handler fails the suite instead of
// silently shipping — it must be added to VERIFIERS (with a check that
// proves the 403).

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

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

async function protectGuest(guestId: string): Promise<void> {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

function apiRouteFiles(): string[] {
  const root = path.join(process.cwd(), "app/api");
  const results: string[] = [];
  function walk(dir: string, rel: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), `${rel}${entry.name}/`);
      } else if (entry.name === "route.ts") {
        results.push(rel.replace(/\/$/, ""));
      }
    }
  }
  walk(root, "");
  return results.sort();
}

// Independent auth layers (admin/site gates), not the acting-guest
// invariant this guard covers; and the unauthenticated health check.
// The SPA's static files are not acting-guest surfaces either.
const OUT_OF_SCOPE_PREFIXES = ["auth/", "spa/"];
const OUT_OF_SCOPE_EXACT = new Set(["health"]);

type Verifier = () => Promise<void>;

const VERIFIERS: Record<string, Verifier> = {
  "v1/[[...route]]": async () => {
    const { POST } = await import("@/app/api/v1/[[...route]]/route");
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest({ eventId: event.id });
    await protectGuest(guest.id);
    const location = await createLocation({ eventId: event.id });
    const day = await createDay(event.id);
    const res = await POST(
      new NextRequest("http://test/api/v1/sessions", {
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

  const files = apiRouteFiles().filter(
    (f) =>
      !OUT_OF_SCOPE_PREFIXES.some((p) => f.startsWith(p)) &&
      !OUT_OF_SCOPE_EXACT.has(f)
  );

  for (const f of files) {
    it(`app/api/${f}/route.ts is guarded or explicitly read-only`, () => {
      expect(
        f in VERIFIERS,
        `app/api/${f}/route.ts is not in VERIFIERS in ` +
          `tests/integration/mutating-surface-guard.test.ts — add it`
      ).toBe(true);
    });
  }

  for (const [name, verify] of Object.entries(VERIFIERS)) {
    it(
      `app/api/${name} rejects acting as a protected guest without a verified session`,
      verify
    );
  }
});
