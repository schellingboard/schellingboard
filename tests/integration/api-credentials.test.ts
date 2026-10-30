// @module-tag 003-US3
// @module-tag 003-US4
// @module-tag 003-US5
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
import { DELETE, GET, POST, PUT } from "@/app/api/v1/[[...route]]/route";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
  isMailerConfigured: vi.fn(() => true),
}));

import { getRepositories } from "@/db/container";
import { LOGIN_LIMITS, resetRateLimits } from "@/server/kernel/rate-limit";
import { hashSessionToken } from "@/utils/login-session-token";
import { hashUserPassword } from "@/utils/user-credentials";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, sessionGuestValue } from "../helpers/guest-cookie";

const handlers = { GET, POST, PUT, DELETE };

const call = (
  method: keyof typeof handlers,
  path: string,
  body?: unknown,
  cookie?: string
) =>
  handlers[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

const asSession = (token: string) => `${GUEST_COOKIE_NAME}=${token}`;
const codeOf = async (res: Response) =>
  ((await res.json()) as { code: string }).code;
const cookieOf = (res: Response) =>
  (res.headers.get("set-cookie") ?? "").split(";")[0];

async function emailedResetToken(): Promise<string> {
  const mail = vi
    .mocked(sendMail)
    .mock.calls.map(([m]) => m)
    .findLast((m) => m.subject === "Set your password");
  if (!mail) throw new Error("No reset link was sent");
  const html = await render(mail.body);
  const token = html.match(/token=([^"&]+)/)?.[1];
  if (!token) throw new Error("No token in the email");
  return decodeURIComponent(token);
}

const PASSWORD = "hunter2 forever";

async function protectedGuest(password = PASSWORD) {
  const guest = await createGuest({ email: "ada@test.example" });
  await getRepositories().guests.setAuthProtection(guest.id, {
    authProtected: true,
    passwordHash: await hashUserPassword(password),
  });
  return guest;
}

const rowsOf = (guestId: string) =>
  getRepositories().loginSessions.listForGuest(guestId);

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

describe("POST /api/v1/auth/reset-link", () => {
  it(
    "emails a reset link and changes nothing yet",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest({ email: "ada@test.example" });

      const res = await call("POST", "/auth/reset-link", {
        guestId: guest.id,
      });

      expect(res.status).toBe(204);
      expect(vi.mocked(sendMail).mock.calls[0][0].to).toBe("ada@test.example");
      expect(
        (await getRepositories().guests.getAuthCredentials(guest.id))
          ?.authProtected
      ).toBe(false);
    }
  );

  it("answers 404 for an unknown guest", { tags: ["003-US5"] }, async () => {
    const res = await call("POST", "/auth/reset-link", { guestId: "nobody" });

    expect(res.status).toBe(404);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("answers 503 without a mailer", { tags: ["003-US5"] }, async () => {
    vi.mocked(isMailerConfigured).mockReturnValue(false);
    const guest = await createGuest();

    const res = await call("POST", "/auth/reset-link", { guestId: guest.id });

    expect(res.status).toBe(503);
    expect(await codeOf(res)).toBe("auth.mailUnavailable");
  });

  it(
    "answers 409 while a link sent moments ago is still valid",
    { tags: ["003-US5"] },
    async () => {
      const guest = await createGuest();
      await call("POST", "/auth/reset-link", { guestId: guest.id });

      const res = await call("POST", "/auth/reset-link", {
        guestId: guest.id,
      });

      expect(res.status).toBe(409);
      expect(await codeOf(res)).toBe("auth.linkRecentlySent");
      expect(sendMail).toHaveBeenCalledTimes(1);
    }
  );
});

describe("POST /api/v1/auth/reset", () => {
  it(
    "sets the first password and protects the name, without signing in",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest();
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();

      const res = await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "a brand new password",
      });

      expect(res.status).toBe(204);
      expect(res.headers.get("set-cookie")).toBeNull();
      expect(
        (await getRepositories().guests.getAuthCredentials(guest.id))
          ?.authProtected
      ).toBe(true);
      const login = await call("POST", "/auth/login", {
        guestId: guest.id,
        credential: "a brand new password",
      });
      expect(login.status).toBe(200);
    }
  );

  it(
    "refuses a wrong token and changes nothing",
    { tags: ["003-US5"] },
    async () => {
      const guest = await createGuest();
      await call("POST", "/auth/reset-link", { guestId: guest.id });

      const res = await call("POST", "/auth/reset", {
        guestId: guest.id,
        token: "not-the-token",
        newPassword: "a brand new password",
      });

      expect(res.status).toBe(403);
      expect(await codeOf(res)).toBe("auth.credentialWrong");
      expect(
        (await getRepositories().guests.getAuthCredentials(guest.id))
          ?.authProtected
      ).toBe(false);
    }
  );

  it("works once", { tags: ["003-US5"] }, async () => {
    const guest = await createGuest();
    await call("POST", "/auth/reset-link", { guestId: guest.id });
    const token = await emailedResetToken();
    const body = { guestId: guest.id, token, newPassword: "a brand new one" };
    await call("POST", "/auth/reset", body);

    const again = await call("POST", "/auth/reset", body);

    expect(again.status).toBe(403);
  });

  it("refuses a short password", { tags: ["003-US3"] }, async () => {
    const guest = await createGuest();
    await call("POST", "/auth/reset-link", { guestId: guest.id });
    const token = await emailedResetToken();

    const res = await call("POST", "/auth/reset", {
      guestId: guest.id,
      token,
      newPassword: "short",
    });

    expect(res.status).toBe(400);
  });

  it(
    "a reset link survives any number of wrong tokens",
    { tags: ["003-US5"] },
    async () => {
      const guest = await createGuest();
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();
      for (let i = 0; i < 101; i++)
        await call("POST", "/auth/reset", {
          guestId: guest.id,
          token: "nope",
          newPassword: "long enough",
        });

      const res = await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "correct horse battery",
      });

      expect(res.status).toBe(204);
    }
  );

  it(
    "a too-short password does not use up the token",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest();
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();
      await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "short",
      });

      const res = await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "correct horse battery",
      });

      expect(res.status).toBe(204);
    }
  );

  it(
    "setting the first password sends no security email",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest();
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();

      await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "correct horse battery",
      });

      expect(sendMail).toHaveBeenCalledTimes(1);
    }
  );

  it(
    "a reset of a protected name signs out its sessions, this browser's included, and emails the owner",
    { tags: ["003-US5"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");
      await sessionGuestValue(guest.id, "verified");
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();

      const res = await call(
        "POST",
        "/auth/reset",
        { guestId: guest.id, token, newPassword: "a brand new password" },
        asSession(mine)
      );

      expect(res.status).toBe(204);
      expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
      expect(await rowsOf(guest.id)).toEqual([]);
      expect(vi.mocked(sendMail).mock.calls.at(-1)?.[0].subject).toMatch(
        /password/i
      );
    }
  );

  it(
    "the first password keeps other browsers' claimed sessions",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest();
      await sessionGuestValue(guest.id, "claimed");
      await sessionGuestValue(guest.id, "verified");
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();

      await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "a brand new password",
      });

      expect((await rowsOf(guest.id)).map((r) => r.assurance)).toEqual([
        "claimed",
      ]);
    }
  );
});

describe("PUT /api/v1/me/credentials/password", () => {
  it(
    "changes the password, keeps this session and drops the others",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");
      await sessionGuestValue(guest.id, "verified");

      const res = await call(
        "PUT",
        "/me/credentials/password",
        { currentPassword: PASSWORD, newPassword: "another good password" },
        asSession(mine)
      );

      expect(res.status).toBe(204);
      expect((await rowsOf(guest.id)).map((r) => r.id)).toEqual([
        hashSessionToken(mine),
      ]);
      const login = await call("POST", "/auth/login", {
        guestId: guest.id,
        credential: "another good password",
      });
      expect(login.status).toBe(200);
    }
  );

  it(
    "answers 403 auth.credentialWrong for a wrong current password",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");

      const res = await call(
        "PUT",
        "/me/credentials/password",
        { currentPassword: "wrong", newPassword: "another good password" },
        asSession(mine)
      );

      expect(res.status).toBe(403);
      expect(await codeOf(res)).toBe("auth.credentialWrong");
    }
  );

  it(
    "needs a verified session of a protected name",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const claimed = await sessionGuestValue(guest.id, "claimed");
      const body = {
        currentPassword: PASSWORD,
        newPassword: "another good password",
      };

      expect((await call("PUT", "/me/credentials/password", body)).status).toBe(
        403
      );
      expect(
        (
          await call(
            "PUT",
            "/me/credentials/password",
            body,
            asSession(claimed)
          )
        ).status
      ).toBe(403);
      const open = await createGuest();
      const openSession = await sessionGuestValue(open.id, "claimed");
      const res = await call(
        "PUT",
        "/me/credentials/password",
        body,
        asSession(openSession)
      );
      expect(res.status).toBe(409);
      expect(await codeOf(res)).toBe("auth.notProtected");
    }
  );
});

describe("POST /api/v1/me/credentials/unprotect", () => {
  it(
    "succeeds even if the security email fails to send",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");
      vi.mocked(sendMail).mockRejectedValueOnce(new Error("smtp down"));

      const res = await call(
        "POST",
        "/me/credentials/unprotect",
        { currentPassword: PASSWORD },
        asSession(mine)
      );

      expect(res.status).toBe(200);
      expect(
        (await getRepositories().guests.getAuthCredentials(guest.id))
          ?.authProtected
      ).toBe(false);
    }
  );

  it(
    "removes the protection and keeps the browser on the name, unverified",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");

      const res = await call(
        "POST",
        "/me/credentials/unprotect",
        { currentPassword: PASSWORD },
        asSession(mine)
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ guestId: guest.id });
      expect(
        await getRepositories().guests.getAuthCredentials(guest.id)
      ).toEqual({ authProtected: false, passwordHash: null });
      const rows = await rowsOf(guest.id);
      expect(rows.map((r) => r.assurance)).toEqual(["claimed"]);
      expect(rows[0].id).toBe(hashSessionToken(cookieOf(res).split("=")[1]));
    }
  );

  it(
    "answers 403 for a wrong password and leaves the name protected",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");

      const res = await call(
        "POST",
        "/me/credentials/unprotect",
        { currentPassword: "wrong" },
        asSession(mine)
      );

      expect(res.status).toBe(403);
      expect(
        (await getRepositories().guests.getAuthCredentials(guest.id))
          ?.authProtected
      ).toBe(true);
    }
  );
});

describe("PUT /api/v1/me/credentials/username", () => {
  it(
    "sets a username that logs in with the password, and so does the email",
    { tags: ["003-US4"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");

      const res = await call(
        "PUT",
        "/me/credentials/username",
        { username: "Ada.Lovelace" },
        asSession(mine)
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ username: "ada.lovelace" });
      for (const identifier of ["ada.lovelace", "ADA@test.example"]) {
        const login = await call("POST", "/auth/login", {
          identifier,
          credential: PASSWORD,
        });
        expect(login.status).toBe(200);
        expect(await login.json()).toEqual({ guestId: guest.id });
      }
    }
  );

  it(
    "answers 409 username.taken for another guest's username",
    { tags: ["003-US4"] },
    async () => {
      const ada = await protectedGuest();
      const bob = await createGuest();
      await call(
        "PUT",
        "/me/credentials/username",
        { username: "ada" },
        asSession(await sessionGuestValue(ada.id, "verified"))
      );

      const res = await call(
        "PUT",
        "/me/credentials/username",
        { username: "ADA" },
        asSession(await sessionGuestValue(bob.id, "claimed"))
      );

      expect(res.status).toBe(409);
      expect(await codeOf(res)).toBe("username.taken");
    }
  );

  it(
    "refuses a username shaped like an email",
    { tags: ["003-US4"] },
    async () => {
      const guest = await createGuest();

      const res = await call(
        "PUT",
        "/me/credentials/username",
        { username: "a@b.example" },
        asSession(await sessionGuestValue(guest.id, "claimed"))
      );

      expect(res.status).toBe(400);
    }
  );

  it("removes the username with null", { tags: ["003-US4"] }, async () => {
    const guest = await protectedGuest();
    const mine = asSession(await sessionGuestValue(guest.id, "verified"));
    await call("PUT", "/me/credentials/username", { username: "ada" }, mine);

    const res = await call(
      "PUT",
      "/me/credentials/username",
      { username: null },
      mine
    );

    expect(await res.json()).toEqual({ username: null });
    const login = await call("POST", "/auth/login", {
      identifier: "ada",
      credential: PASSWORD,
    });
    expect(login.status).toBe(403);
  });
});

describe("POST /api/v1/auth/login with an identifier", () => {
  it(
    "answers 403 auth.credentialWrong for an unknown identifier",
    { tags: ["003-US4"] },
    async () => {
      const res = await call("POST", "/auth/login", {
        identifier: "nobody@test.example",
        credential: "whatever",
      });

      expect(res.status).toBe(403);
      expect(await codeOf(res)).toBe("auth.credentialWrong");
    }
  );

  it(
    "needs exactly one of guestId and identifier",
    { tags: ["003-US4"] },
    async () => {
      const res = await call("POST", "/auth/login", { credential: "x" });

      expect(res.status).toBe(400);
    }
  );
});

describe("/api/v1/me/login-sessions", () => {
  it(
    "lists the guest's own sessions and marks this browser's",
    { tags: ["003-US2"] },
    async () => {
      const guest = await createGuest();
      const other = await createGuest();
      const mine = await sessionGuestValue(guest.id, "claimed");
      await sessionGuestValue(guest.id, "claimed");
      await sessionGuestValue(other.id, "claimed");

      const res = await call(
        "GET",
        "/me/login-sessions",
        undefined,
        asSession(mine)
      );

      expect(res.status).toBe(200);
      const list = (await res.json()) as {
        id: string;
        current: boolean;
        assurance: string;
      }[];
      expect(list).toHaveLength(2);
      expect(list.filter((s) => s.current).map((s) => s.id)).toEqual([
        hashSessionToken(mine),
      ]);
    }
  );

  it("needs a session", { tags: ["003-US2"] }, async () => {
    const res = await call("GET", "/me/login-sessions");

    expect(res.status).toBe(403);
  });

  it(
    "revokes another session of the guest",
    { tags: ["003-US2"] },
    async () => {
      const guest = await createGuest();
      const mine = await sessionGuestValue(guest.id, "claimed");
      const elsewhere = await sessionGuestValue(guest.id, "claimed");

      const res = await call(
        "DELETE",
        `/me/login-sessions/${hashSessionToken(elsewhere)}`,
        undefined,
        asSession(mine)
      );

      expect(res.status).toBe(204);
      expect(res.headers.get("set-cookie")).toBeNull();
      expect((await rowsOf(guest.id)).map((r) => r.id)).toEqual([
        hashSessionToken(mine),
      ]);
    }
  );

  it(
    "revoking this browser's own session also clears its cookie",
    { tags: ["003-US2"] },
    async () => {
      const guest = await createGuest();
      const mine = await sessionGuestValue(guest.id, "claimed");

      const res = await call(
        "DELETE",
        `/me/login-sessions/${hashSessionToken(mine)}`,
        undefined,
        asSession(mine)
      );

      expect(res.status).toBe(204);
      expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
    }
  );

  it(
    "answers 404 for another guest's session",
    { tags: ["003-US2"] },
    async () => {
      const guest = await createGuest();
      const other = await createGuest();
      const mine = await sessionGuestValue(guest.id, "claimed");
      const theirs = await sessionGuestValue(other.id, "claimed");

      const res = await call(
        "DELETE",
        `/me/login-sessions/${hashSessionToken(theirs)}`,
        undefined,
        asSession(mine)
      );

      expect(res.status).toBe(404);
      expect(await rowsOf(other.id)).toHaveLength(1);
    }
  );
});

describe("naming a guest by identifier on the unauthenticated routes", () => {
  it(
    "login-code and reset-link answer 204 for an unknown identifier and send nothing",
    { tags: ["003-US5"] },
    async () => {
      for (const path of ["/auth/login-code", "/auth/reset-link"]) {
        const res = await call("POST", path, {
          identifier: "nobody@test.example",
        });
        expect(res.status, path).toBe(204);
      }
      expect(sendMail).not.toHaveBeenCalled();
    }
  );

  it(
    "reset-link reaches the guest holding the email",
    { tags: ["003-US5"] },
    async () => {
      await createGuest({ email: "ada@test.example" });

      const res = await call("POST", "/auth/reset-link", {
        identifier: "ADA@test.example",
      });

      expect(res.status).toBe(204);
      expect(vi.mocked(sendMail).mock.calls[0][0].to).toBe("ada@test.example");
    }
  );

  it(
    "needs exactly one of guestId and identifier",
    { tags: ["003-US5"] },
    async () => {
      const res = await call("POST", "/auth/reset-link", {});

      expect(res.status).toBe(400);
    }
  );
});

describe("a locked-out login", () => {
  it(
    "answers a known and an unknown identifier alike",
    { tags: ["003-US4"] },
    async () => {
      await protectedGuest();
      const attempt = async (identifier: string) => {
        let last: Response | undefined;
        for (let i = 0; i <= LOGIN_LIMITS.perClient.capacity; i++)
          last = await call("POST", "/auth/login", {
            identifier,
            credential: "wrong",
          });
        return last!;
      };

      const known = await attempt("ada@test.example");
      const unknown = await attempt("nobody@test.example");

      expect(known.status).toBe(429);
      expect(unknown.status).toBe(429);
      expect(await known.json()).toEqual(await unknown.json());
    }
  );
});

describe("credential changes retire emailed tokens and this browser's claimed row", () => {
  it(
    "a first password from this browser removes its own claimed session",
    { tags: ["003-US3"] },
    async () => {
      const guest = await createGuest();
      const mine = await sessionGuestValue(guest.id, "claimed");
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();

      await call(
        "POST",
        "/auth/reset",
        { guestId: guest.id, token, newPassword: "a brand new password" },
        asSession(mine)
      );

      expect(await rowsOf(guest.id)).toEqual([]);
    }
  );

  it(
    "changing the password retires an outstanding reset link",
    { tags: ["003-US5"] },
    async () => {
      const guest = await protectedGuest();
      const mine = await sessionGuestValue(guest.id, "verified");
      await call("POST", "/auth/reset-link", { guestId: guest.id });
      const token = await emailedResetToken();

      await call(
        "PUT",
        "/me/credentials/password",
        { currentPassword: PASSWORD, newPassword: "another good password" },
        asSession(mine)
      );
      const res = await call("POST", "/auth/reset", {
        guestId: guest.id,
        token,
        newPassword: "an attacker's choice",
      });

      expect(res.status).toBe(403);
    }
  );
});

describe("GET /api/v1/me/credentials", () => {
  it(
    "tells whether the name is protected and what its username is",
    { tags: ["003-US3"] },
    async () => {
      const guest = await protectedGuest();
      const mine = asSession(await sessionGuestValue(guest.id, "verified"));
      await call("PUT", "/me/credentials/username", { username: "ada" }, mine);

      const res = await call("GET", "/me/credentials", undefined, mine);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        authProtected: true,
        username: "ada",
      });
    }
  );

  it("needs a session", { tags: ["003-US3"] }, async () => {
    expect((await call("GET", "/me/credentials")).status).toBe(403);
  });
});
