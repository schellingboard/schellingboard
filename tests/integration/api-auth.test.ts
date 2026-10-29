// @module-tag 003-US2
// @module-tag 003-US4
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { render } from "@react-email/render";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/[[...route]]/route";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
  isMailerConfigured: vi.fn(() => true),
}));

import { getRepositories } from "@/db/container";
import {
  AUTH_API_LIMIT,
  EMAIL_LIMIT,
  LOGIN_LIMITS,
  recordEmailIssued,
  resetRateLimits,
} from "@/server/kernel/rate-limit";
import { hashSessionToken } from "@/utils/login-session-token";
import { MAX_CODE_ATTEMPTS, hashUserPassword } from "@/utils/user-credentials";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, sessionGuestValue } from "../helpers/guest-cookie";

const post = (path: string, body?: unknown, cookie?: string) =>
  POST(
    new NextRequest(`http://test/api/v1/auth/${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

const whoAmI = (cookie: string) =>
  GET(
    new NextRequest("http://test/api/v1/me/identity", {
      headers: { cookie },
    })
  );

const codeOf = async (res: Response) =>
  ((await res.json()) as { code: string }).code;

const cookieOf = (res: Response) =>
  (res.headers.get("set-cookie") ?? "").split(";")[0];

async function emailedCode(): Promise<string> {
  const call = vi.mocked(sendMail).mock.calls.at(-1)?.[0];
  if (!call) throw new Error("No email was sent");
  const html = await render(call.body);
  const code = html.match(/>([A-HJ-NP-Z2-9]{8})</)?.[1];
  if (!code) throw new Error("No code in the email");
  return code;
}

async function protectedGuest(password = "hunter2 forever") {
  const guest = await createGuest({ email: "ada@test.example" });
  await getRepositories().guests.setAuthProtection(guest.id, {
    authProtected: true,
    passwordHash: await hashUserPassword(password),
  });
  return guest;
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  resetRateLimits();
  vi.mocked(sendMail).mockReset();
  vi.mocked(isMailerConfigured).mockReturnValue(true);
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  vi.stubEnv("SITE_URL", "https://sessions.test.example");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/v1/auth/login-code", () => {
  it("emails a code and answers 204", { tags: ["003-US4"] }, async () => {
    const guest = await protectedGuest();

    const res = await post("login-code", { guestId: guest.id });

    expect(res.status).toBe(204);
    expect(vi.mocked(sendMail).mock.calls[0][0].to).toBe("ada@test.example");
    expect(await emailedCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });

  it("answers 404 for an unknown guest", { tags: ["003-US4"] }, async () => {
    const res = await post("login-code", { guestId: "nobody" });

    expect(res.status).toBe(404);
    expect(await codeOf(res)).toBe("guest.notFound");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("answers 503 without a mailer", { tags: ["003-US4"] }, async () => {
    vi.mocked(isMailerConfigured).mockReturnValue(false);
    const guest = await protectedGuest();

    const res = await post("login-code", { guestId: guest.id });

    expect(res.status).toBe(503);
    expect(await codeOf(res)).toBe("auth.mailUnavailable");
  });

  it(
    "answers 409 while a code sent moments ago is still valid",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      await post("login-code", { guestId: guest.id });

      const res = await post("login-code", { guestId: guest.id });

      expect(res.status).toBe(409);
      expect(await codeOf(res)).toBe("auth.codeRecentlySent");
      expect(sendMail).toHaveBeenCalledTimes(1);
    }
  );
});

describe("POST /api/v1/auth/login-code limits", () => {
  it(
    "answers 409 auth.codeSpent once the code has no guesses left",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      await post("login-code", { guestId: guest.id });
      const { authCodes } = getRepositories();
      const active = await authCodes.findActive(guest.id, "login", new Date());
      for (let i = 0; i < MAX_CODE_ATTEMPTS; i++)
        await authCodes.recordFailedAttempt(active!.id);

      const res = await post("login-code", { guestId: guest.id });

      expect(res.status).toBe(409);
      expect(await codeOf(res)).toBe("auth.codeSpent");
    }
  );

  it(
    "answers 429 auth.tooManyEmails with Retry-After after a day's emails",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      for (let i = 0; i < EMAIL_LIMIT.capacity; i++)
        recordEmailIssued(guest.id);

      const res = await post("login-code", { guestId: guest.id });

      expect(res.status).toBe(429);
      expect(await codeOf(res)).toBe("auth.tooManyEmails");
      expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
    }
  );
});

describe("POST /api/v1/auth/login", () => {
  it(
    "logs in with the emailed code and starts a verified session",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      await post("login-code", { guestId: guest.id });
      const credential = await emailedCode();

      const res = await post("login", { guestId: guest.id, credential });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ guestId: guest.id });
      const identity = await whoAmI(cookieOf(res));
      expect(await identity.json()).toEqual({ guestId: guest.id });
      const token = cookieOf(res).split("=")[1];
      expect(
        await getRepositories().loginSessions.get(hashSessionToken(token))
      ).toMatchObject({ guestId: guest.id, assurance: "verified" });
    }
  );

  it(
    "spends the code: a second login with it fails",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      await post("login-code", { guestId: guest.id });
      const credential = await emailedCode();
      await post("login", { guestId: guest.id, credential });

      const again = await post("login", { guestId: guest.id, credential });

      expect(again.status).toBe(403);
    }
  );

  it("logs in with the password", { tags: ["003-US4"] }, async () => {
    const guest = await protectedGuest();

    const res = await post("login", {
      guestId: guest.id,
      credential: "hunter2 forever",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain(`${GUEST_COOKIE_NAME}=`);
  });

  it(
    "answers 403 auth.credentialWrong for a wrong password and sets no cookie",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();

      const res = await post("login", {
        guestId: guest.id,
        credential: "wrong",
      });

      expect(res.status).toBe(403);
      expect(await codeOf(res)).toBe("auth.credentialWrong");
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  );

  it("answers 404 for an unknown guest", { tags: ["003-US4"] }, async () => {
    const res = await post("login", { guestId: "nobody", credential: "x" });

    expect(res.status).toBe(404);
  });

  it(
    "answers 429 auth.tooManyAttempts once the password is locked",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      for (let i = 0; i < LOGIN_LIMITS.perClient.capacity; i++)
        await post("login", { guestId: guest.id, credential: "wrong" });

      const res = await post("login", {
        guestId: guest.id,
        credential: "hunter2 forever",
      });

      expect(res.status).toBe(429);
      expect(await codeOf(res)).toBe("auth.tooManyAttempts");
      expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
    }
  );
});

describe("POST /api/v1/auth/sign-out", () => {
  it(
    "revokes the session row and clears the cookie",
    { tags: ["003-US2"] },
    async () => {
      const guest = await createGuest();
      const token = await sessionGuestValue(guest.id, "verified");
      const cookie = `${GUEST_COOKIE_NAME}=${token}`;

      const res = await post("sign-out", undefined, cookie);

      expect(res.status).toBe(204);
      expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
      expect(await (await whoAmI(cookie)).json()).toEqual({ guestId: null });
    }
  );
});

describe("the sign-in routes' own rate limit", () => {
  const fromAddress = () =>
    POST(
      new NextRequest("http://test/api/v1/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.7",
        },
        body: JSON.stringify({ guestId: "nobody", credential: "x" }),
      })
    );

  it(
    "answers 429 with Retry-After once one known address spends its burst",
    { tags: ["003-US4"] },
    async () => {
      vi.stubEnv("SB_TRUSTED_PROXIES", "1");
      vi.stubEnv("SB_AUTH_RATE_BURST", "");
      let last: Response | undefined;
      for (let i = 0; i <= AUTH_API_LIMIT.capacity; i++)
        last = await fromAddress();

      expect(last!.status).toBe(429);
      expect(last!.headers.get("retry-after")).not.toBeNull();
    }
  );

  it(
    "does not pool unknown addresses into one shared limit",
    { tags: ["003-US4"] },
    async () => {
      let last: Response | undefined;
      for (let i = 0; i <= AUTH_API_LIMIT.capacity; i++)
        last = await fromAddress();

      expect(last!.status).toBe(404);
    }
  );
});
