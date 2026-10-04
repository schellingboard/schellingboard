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
import { createAdminAuthCookie } from "@/utils/auth";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createProposal,
  createSession,
} from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function request(
  method: string,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`http://test/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/v1 RSVPs", () => {
  it(
    "RSVPs, lists and withdraws through the API",
    { tags: ["009-US1"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const guest = await createGuest({ eventId: event.id });
      const session = await createSession(event.id);
      const path = `/sessions/${session.id}/rsvps/${guest.id}`;

      const put = await PUT(
        request("PUT", path, { cookie: asGuest(guest.id) })
      );
      expect(put.status).toBe(204);

      const bySession = await GET(
        request("GET", `/sessions/${session.id}/rsvps`)
      );
      expect(await bySession.json()).toMatchObject({
        rsvps: [{ sessionId: session.id, guestId: guest.id }],
      });
      const byGuest = await GET(request("GET", `/guests/${guest.id}/rsvps`));
      expect(await byGuest.json()).toMatchObject({
        rsvps: [{ sessionId: session.id }],
      });

      const del = await DELETE(request("DELETE", path));
      expect(del.status).toBe(204);
      expect(
        await getRepositories().rsvps.listBySession(session.id)
      ).toHaveLength(0);
    }
  );

  it(
    "answers a full session with a 409 problem",
    { tags: ["009-US2"] },
    async () => {
      const event = await createEvent({
        phase: "scheduling",
        rsvpCapacityHardLimit: true,
      });
      const first = await createGuest({ eventId: event.id });
      const second = await createGuest({ eventId: event.id });
      const session = await createSession(event.id, { capacity: 1 });

      await PUT(request("PUT", `/sessions/${session.id}/rsvps/${first.id}`));
      const res = await PUT(
        request("PUT", `/sessions/${session.id}/rsvps/${second.id}`)
      );
      expect(res.status).toBe(409);
      expect(res.headers.get("content-type")).toBe("application/problem+json");
      expect(await res.json()).toMatchObject({ code: "session.full" });
    }
  );

  it(
    "an organizer removes an RSVP under /admin",
    { tags: ["018-US3"] },
    async () => {
      const event = await createEvent();
      const guest = await createGuest({ eventId: event.id });
      const session = await createSession(event.id);
      await getRepositories().rsvps.create({
        sessionId: session.id,
        guestId: guest.id,
      });
      const path = `/admin/sessions/${session.id}/rsvps/${guest.id}`;

      const refused = await DELETE(
        request("DELETE", path, { cookie: asGuest(guest.id) })
      );
      expect(refused.status).toBe(403);

      const admin = await createAdminAuthCookie();
      const res = await DELETE(
        request("DELETE", path, { cookie: `${admin.name}=${admin.value}` })
      );
      expect(res.status).toBe(204);
      expect(
        await getRepositories().rsvps.listBySession(session.id)
      ).toHaveLength(0);
    }
  );
});

describe("/api/v1 votes", () => {
  it(
    "casts, lists and withdraws a vote through the API",
    { tags: ["005-US1"] },
    async () => {
      const event = await createEvent({ phase: "voting" });
      const guest = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, []);
      const path = `/proposals/${proposal.id}/votes/${guest.id}`;

      const put = await PUT(
        request("PUT", path, { body: { choice: "interested" } })
      );
      expect(put.status).toBe(204);

      const listed = await GET(
        request("GET", `/guests/${guest.id}/votes?eventId=${event.id}`)
      );
      expect(await listed.json()).toMatchObject({
        votes: [{ proposalId: proposal.id, choice: "interested" }],
      });

      expect((await DELETE(request("DELETE", path))).status).toBe(204);
      const after = await GET(
        request("GET", `/guests/${guest.id}/votes?eventId=${event.id}`)
      );
      expect(await after.json()).toEqual({ votes: [] });
    }
  );

  it("refuses an unknown choice with request.invalid", async () => {
    const event = await createEvent({ phase: "voting" });
    const guest = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, []);

    const res = await PUT(
      request("PUT", `/proposals/${proposal.id}/votes/${guest.id}`, {
        body: { choice: "love" },
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "request.invalid" });
  });
});
