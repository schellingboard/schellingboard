import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { createAdminAuthCookie } from "@/utils/auth";
import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createDay, createEvent, createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const DAY = isoDay(30);
const SLOT = `${DAY}T10:00:00.000Z`;

const HANDLERS = { GET, POST, PUT, DELETE } as const;

function call(
  method: keyof typeof HANDLERS,
  path: string,
  { body, cookie, key }: { body?: unknown; cookie?: string; key?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  if (key) headers["idempotency-key"] = key;
  return HANDLERS[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
}

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

async function scenario() {
  const repos = getRepositories();
  const event = await createEvent({ phase: "scheduling" });
  await repos.events.update(event.id, {
    meetingsEnabled: true,
    maxOpenMeetingRequests: 5,
  });
  await createDay(event.id, {
    start: new Date(`${DAY}T09:00:00.000Z`),
    end: new Date(`${DAY}T17:00:00.000Z`),
  });
  const ada = await createGuest({ name: "Ada", eventId: event.id });
  const grace = await createGuest({ name: "Grace", eventId: event.id });
  await repos.meetingAvailability.replaceForGuest(grace.id, event.id, [
    new Date(SLOT),
  ]);
  return { event, ada, grace };
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/v1 meetings", () => {
  it(
    "asks for a 1-on-1 once per key, accepts it, and lists it to its pair",
    { tags: ["012-US3", "012-US4", "012-US5", "019-US2"] },
    async () => {
      const { event, ada, grace } = await scenario();
      const ask = () =>
        call("POST", "/meetings", {
          cookie: asGuest(ada.id),
          key: "ask-1",
          body: {
            eventId: event.id,
            recipientId: grace.id,
            slotStart: SLOT,
            meetingPoint: "Coffee bar",
          },
        });

      const created = await ask();
      expect(created.status).toBe(201);
      const meeting = (await created.json()) as { id: string };
      expect(meeting).toMatchObject({
        requesterId: ada.id,
        recipientId: grace.id,
        slotStart: SLOT,
        status: "pending",
        respondedAt: null,
      });
      const retried = await ask();
      expect(retried.status).toBe(201);
      expect(await retried.json()).toEqual(meeting);

      const accepted = await call("POST", `/meetings/${meeting.id}/accept`, {
        cookie: asGuest(grace.id),
      });
      expect(accepted.status).toBe(200);
      expect(await accepted.json()).toMatchObject({ status: "accepted" });

      const listed = await call("GET", `/meetings?eventId=${event.id}`, {
        cookie: asGuest(ada.id),
      });
      expect(listed.status).toBe(200);
      expect(await listed.json()).toEqual({
        meetings: [
          expect.objectContaining({
            id: meeting.id,
            status: "accepted",
            role: "requester",
            otherName: "Grace",
          }),
        ],
        availability: [],
      });
    }
  );

  it(
    "answers refusals as problems with their codes",
    { tags: ["012-US4", "012-US5", "012-US6"] },
    async () => {
      const { event, ada, grace } = await scenario();
      const meeting = await getRepositories().meetings.create({
        eventId: event.id,
        requesterId: ada.id,
        recipientId: grace.id,
        slotStart: new Date(SLOT),
        slotEnd: new Date(`${DAY}T10:30:00.000Z`),
        meetingPoint: "Coffee bar",
        message: "",
        createdAt: new Date(),
      });

      const anonymous = await call("GET", `/meetings?eventId=${event.id}`);
      expect(anonymous.status).toBe(403);
      expect(anonymous.headers.get("content-type")).toBe(
        "application/problem+json"
      );
      expect(await anonymous.json()).toMatchObject({
        code: "guest.unselected",
      });

      const declinedBySelf = await call(
        "POST",
        `/meetings/${meeting.id}/decline`,
        { cookie: asGuest(ada.id) }
      );
      expect(declinedBySelf.status).toBe(403);
      expect(await declinedBySelf.json()).toMatchObject({
        code: "meeting.notRecipient",
      });

      const canceledByRecipient = await call(
        "POST",
        `/meetings/${meeting.id}/cancel`,
        { cookie: asGuest(grace.id), body: { note: "Sorry" } }
      );
      expect(canceledByRecipient.status).toBe(409);
      expect(await canceledByRecipient.json()).toMatchObject({
        code: "meeting.recipientMustDecline",
      });

      const canceled = await call("POST", `/meetings/${meeting.id}/cancel`, {
        cookie: asGuest(ada.id),
      });
      expect(canceled.status).toBe(200);
      expect(await canceled.json()).toMatchObject({ status: "canceled" });

      const candidates = (query: string) =>
        call("GET", `/meeting-candidates?eventId=${event.id}&${query}`, {
          cookie: asGuest(ada.id),
        });
      const badLength = await candidates(`slotStart=${SLOT}&slotCount=0`);
      expect(badLength.status).toBe(400);
      expect(await badLength.json()).toMatchObject({ code: "request.invalid" });
      const closed = await candidates(`slotStart=${DAY}T20:00:00.000Z`);
      expect(closed.status).toBe(404);
      expect(await closed.json()).toMatchObject({
        code: "meeting.slotNotOpen",
      });
      const open = await candidates(`slotStart=${SLOT}`);
      expect(open.status).toBe(200);
      expect(await open.json()).toMatchObject({
        slotCount: 1,
        candidates: [{ id: grace.id, name: "Grace", busy: false }],
      });
    }
  );

  it(
    "replaces the caller's declared slots",
    { tags: ["012-US2"] },
    async () => {
      const { event, ada } = await scenario();

      const saved = await call("PUT", "/meeting-availability", {
        cookie: asGuest(ada.id),
        body: { eventId: event.id, slotStarts: [SLOT] },
      });

      expect(saved.status).toBe(204);
      const listed = await call("GET", `/meetings?eventId=${event.id}`, {
        cookie: asGuest(ada.id),
      });
      expect(await listed.json()).toMatchObject({ availability: [SLOT] });
    }
  );

  it(
    "lets an organizer set up 1-on-1s under /admin",
    { tags: ["012-US1"] },
    async () => {
      const event = await createEvent();
      const adminCookie = await createAdminAuthCookie();
      const admin = `${adminCookie.name}=${adminCookie.value}`;

      const refused = await call("PUT", `/admin/events/${event.id}/meetings`, {
        body: { meetingsEnabled: true, maxOpenMeetingRequests: 3 },
      });
      expect(refused.status).toBe(403);
      expect(await refused.json()).toMatchObject({ code: "admin.required" });
      const enabled = await call("PUT", `/admin/events/${event.id}/meetings`, {
        cookie: admin,
        body: { meetingsEnabled: true, maxOpenMeetingRequests: 3 },
      });
      expect(enabled.status).toBe(204);

      const points = `/admin/events/${event.id}/meeting-points`;
      const created = await call("POST", points, {
        cookie: admin,
        body: { name: "Coffee bar" },
      });
      expect(created.status).toBe(201);
      const point = (await created.json()) as { id: string };
      expect(point).toMatchObject({
        eventId: event.id,
        name: "Coffee bar",
        description: "",
        sortIndex: 0,
      });
      const renamed = await call("PUT", `${points}/${point.id}`, {
        cookie: admin,
        body: { name: "Lobby" },
      });
      expect(renamed.status).toBe(200);
      expect(await renamed.json()).toMatchObject({ name: "Lobby" });
      const deleted = await call("DELETE", `${points}/${point.id}`, {
        cookie: admin,
      });
      expect(deleted.status).toBe(204);
      const gone = await call("DELETE", `${points}/${point.id}`, {
        cookie: admin,
      });
      expect(gone.status).toBe(404);
      expect(await gone.json()).toMatchObject({
        code: "meetingPoint.notFound",
      });
    }
  );
});
