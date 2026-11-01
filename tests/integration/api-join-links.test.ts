import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render } from "@react-email/render";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/[[...route]]/route";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
  isMailerConfigured: vi.fn(() => true),
}));

import { getRepositories } from "@/db/container";
import { hashUserPassword } from "@/utils/user-credentials";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { createEvent, createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "../helpers/guest-cookie";

const cookieHeader = (value: string) => `${GUEST_COOKIE_NAME}=${value}`;

const post = (path: string, body?: unknown, cookie?: string) =>
  POST(
    new NextRequest(`http://test/api/v1${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

const adminCookie = async () => {
  const { value } = await createAdminAuthCookie();
  return cookieHeader(value);
};

async function linkFor(guestId: string, eventId: string, admin: string) {
  const res = await post(
    `/admin/events/${eventId}/guests/${guestId}/join-link`,
    undefined,
    admin
  );
  expect(res.status).toBe(201);
  return ((await res.json()) as { token: string }).token;
}

const field = async (res: Response, name: string) =>
  ((await res.json()) as Record<string, unknown>)[name];

const members = async (eventId: string) =>
  (await getRepositories().guests.listByEvent(eventId)).map((g) => g.id);

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.mocked(sendMail).mockReset();
  vi.mocked(isMailerConfigured).mockReturnValue(true);
  vi.stubEnv("SITE_URL", "https://sessions.test.example");
});

describe("a personal join link", () => {
  it(
    "signs its guest in and joins the event",
    { tags: ["003-US6"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const token = await linkFor(guest.id, event.id, await adminCookie());

      const res = await post("/auth/join", { token });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        guestId: guest.id,
        eventSlug: event.slug,
        joined: true,
      });
      expect(await members(event.id)).toEqual([guest.id]);
      const cookie = (res.headers.get("set-cookie") ?? "").split(";")[0];
      const who = await GET(
        new NextRequest("http://test/api/v1/me/identity", {
          headers: { cookie },
        })
      );
      expect(await who.json()).toEqual({ guestId: guest.id });
    }
  );

  it(
    "also signs in a guest who holds a password set before the link",
    { tags: ["003-US6"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });
      await new Promise((r) => setTimeout(r, 5));
      const token = await linkFor(guest.id, event.id, await adminCookie());

      const res = await post("/auth/join", { token });

      expect(await field(res, "joined")).toBe(true);
    }
  );

  it(
    "stops signing in once its guest sets a password, and asks for a sign-in",
    { tags: ["003-US6"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const token = await linkFor(guest.id, event.id, await adminCookie());
      await new Promise((r) => setTimeout(r, 5));
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });

      const anonymous = await post("/auth/join", { token });

      expect(anonymous.status).toBe(200);
      expect(await anonymous.json()).toEqual({
        guestId: guest.id,
        eventSlug: event.slug,
        joined: false,
      });
      expect(anonymous.headers.get("set-cookie")).toBeNull();
      expect(await members(event.id)).toEqual([]);

      const signedIn = await post(
        "/auth/join",
        { token },
        cookieHeader(await verifiedGuestValue(guest.id))
      );
      expect(await field(signedIn, "joined")).toBe(true);
      expect(await members(event.id)).toEqual([guest.id]);
    }
  );

  it("does not sign a site admin in", { tags: ["003-US6"] }, async () => {
    const event = await createEvent();
    const guest = await createGuest();
    await getRepositories().guests.setSiteAdmin(guest.id, true);
    const token = await linkFor(guest.id, event.id, await adminCookie());

    const res = await post("/auth/join", { token });

    expect(await field(res, "joined")).toBe(false);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it(
    "does not join for a session of someone else",
    { tags: ["003-US6"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const other = await createGuest();
      const token = await linkFor(guest.id, event.id, await adminCookie());
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: await hashUserPassword("hunter2 forever"),
      });

      const res = await post(
        "/auth/join",
        { token },
        cookieHeader(await verifiedGuestValue(other.id))
      );

      expect(await field(res, "joined")).toBe(false);
      expect(await members(event.id)).toEqual([]);
    }
  );

  it(
    "is ended by a newer link for the same guest and event",
    { tags: ["003-US6"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const admin = await adminCookie();
      const first = await linkFor(guest.id, event.id, admin);
      await linkFor(guest.id, event.id, admin);

      const res = await post("/auth/join", { token: first });

      expect(res.status).toBe(403);
      expect(await field(res, "code")).toBe("join.tokenWrong");
    }
  );

  it("refuses a token nobody holds", { tags: ["003-US6"] }, async () => {
    const res = await post("/auth/join", { token: "nope" });

    expect(res.status).toBe(403);
    expect(await field(res, "code")).toBe("join.tokenWrong");
  });
});

describe("POST /admin/events/{id}/guests/{guestId}/join-link", () => {
  it("is for site admins", { tags: ["016-US5"] }, async () => {
    const event = await createEvent();
    const guest = await createGuest();

    const res = await post(
      `/admin/events/${event.id}/guests/${guest.id}/join-link`,
      undefined,
      cookieHeader(await verifiedGuestValue(guest.id))
    );

    expect(res.status).toBe(403);
  });

  it(
    "answers 404 for an unknown guest or event",
    { tags: ["016-US5"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const admin = await adminCookie();

      const noGuest = await post(
        `/admin/events/${event.id}/guests/nobody/join-link`,
        undefined,
        admin
      );
      const noEvent = await post(
        `/admin/events/nowhere/guests/${guest.id}/join-link`,
        undefined,
        admin
      );

      expect([noGuest.status, noEvent.status]).toEqual([404, 404]);
    }
  );

  it(
    "emails the guest that a new link exists, without the link",
    { tags: ["016-US5"] },
    async () => {
      const event = await createEvent({ name: "Summer Camp" });
      const guest = await createGuest({ email: "ada@test.example" });

      const token = await linkFor(guest.id, event.id, await adminCookie());

      const sent = vi.mocked(sendMail).mock.calls.map(([m]) => m);
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe("ada@test.example");
      expect(await render(sent[0].body)).not.toContain(token);
    }
  );

  it(
    "does not keep the token in a replayed answer",
    { tags: ["016-US5"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest();
      const admin = await adminCookie();
      const path = `/admin/events/${event.id}/guests/${guest.id}/join-link`;
      const send = () =>
        POST(
          new NextRequest(`http://test/api/v1${path}`, {
            method: "POST",
            headers: { cookie: admin, "idempotency-key": "same-key" },
          })
        );

      const [a, b] = [await send(), await send()];

      expect(await field(a, "token")).not.toEqual(await field(b, "token"));
    }
  );

  it(
    "still makes the link when the server cannot send email",
    { tags: ["016-US5"] },
    async () => {
      vi.mocked(isMailerConfigured).mockReturnValue(false);
      const event = await createEvent();
      const guest = await createGuest();

      await linkFor(guest.id, event.id, await adminCookie());

      expect(sendMail).not.toHaveBeenCalled();
    }
  );
});

describe("POST /admin/events/{id}/join-links/mail", () => {
  it(
    "mails every guest of the event their own link",
    { tags: ["016-US5"] },
    async () => {
      const event = await createEvent();
      const ada = await createGuest({
        email: "ada@test.example",
        eventId: event.id,
      });
      await createGuest({ email: "bo@test.example", eventId: event.id });
      await createGuest({ email: "outsider@test.example" });

      const res = await post(
        `/admin/events/${event.id}/join-links/mail`,
        {},
        await adminCookie()
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ sent: 2, withoutEmail: 0, failed: 0 });
      const bodies = await Promise.all(
        vi.mocked(sendMail).mock.calls.map(async ([m]) => ({
          to: m.to,
          html: await render(m.body),
        }))
      );
      expect(bodies.map((b) => b.to).sort()).toEqual([
        "ada@test.example",
        "bo@test.example",
      ]);
      const adaMail = bodies.find((b) => b.to === "ada@test.example")!;
      const token = adaMail.html.match(/\/join\/([A-Za-z0-9_-]+)"/)?.[1];
      expect(token).toBeTruthy();
      const joined = await post("/auth/join", { token });
      expect(await field(joined, "guestId")).toBe(ada.id);
    }
  );

  it(
    "mails only the selected guests and counts those without email",
    { tags: ["016-US5"] },
    async () => {
      const event = await createEvent();
      const ada = await createGuest({ email: "ada@test.example" });
      const nobody = await createGuest({ email: "  " });
      await createGuest({ email: "bo@test.example", eventId: event.id });

      const res = await post(
        `/admin/events/${event.id}/join-links/mail`,
        { guestIds: [ada.id, nobody.id] },
        await adminCookie()
      );

      expect(await res.json()).toEqual({ sent: 1, withoutEmail: 1, failed: 0 });
      expect(vi.mocked(sendMail).mock.calls.map(([m]) => m.to)).toEqual([
        "ada@test.example",
      ]);
    }
  );

  it("refuses an unknown guest id", { tags: ["016-US5"] }, async () => {
    const event = await createEvent();

    const res = await post(
      `/admin/events/${event.id}/join-links/mail`,
      { guestIds: ["nobody"] },
      await adminCookie()
    );

    expect(res.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("counts a failed send", { tags: ["016-US5"] }, async () => {
    const event = await createEvent();
    await createGuest({ email: "ada@test.example", eventId: event.id });
    vi.mocked(sendMail).mockRejectedValue(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await post(
      `/admin/events/${event.id}/join-links/mail`,
      {},
      await adminCookie()
    );

    expect(await res.json()).toEqual({ sent: 0, withoutEmail: 0, failed: 1 });
  });

  it(
    "is 503 when the server cannot send email",
    { tags: ["016-US5"] },
    async () => {
      vi.mocked(isMailerConfigured).mockReturnValue(false);
      const event = await createEvent();

      const res = await post(
        `/admin/events/${event.id}/join-links/mail`,
        {},
        await adminCookie()
      );

      expect(res.status).toBe(503);
      expect(await field(res, "code")).toBe("auth.mailUnavailable");
    }
  );
});
