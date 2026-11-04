// @module-tag 007-US8
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { GET } from "@/tests/helpers/v1-route";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
  createUnavailability,
} from "../helpers/factories";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const at = (iso: string) => new Date(`2026-06-${iso}:00.000Z`);

beforeAll(() => setupTestDb());
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-06-15T10:00:00.000Z"));
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

// Every id in the world gets a stable label, so the golden files hold no
// random ids.
async function world() {
  const repos = getRepositories();
  const event = await createEvent({
    name: "Golden Conf",
    proposalPhaseStart: at("01T00:00"),
    proposalPhaseEnd: at("05T00:00"),
    votingPhaseStart: at("05T00:00"),
    votingPhaseEnd: at("10T00:00"),
    schedulingPhaseStart: at("10T00:00"),
    schedulingPhaseEnd: at("20T00:00"),
  });
  const day = await createDay(event.id, {
    start: at("15T08:00"),
    end: at("15T18:00"),
    startBookings: at("15T09:00"),
    endBookings: at("15T17:00"),
  });
  const room = await createLocation({ name: "Room A", eventId: event.id });
  const mia = await createGuest({ name: "Mia Open", eventId: event.id });
  const pia = await createGuest({ name: "Pia Protected", eventId: event.id });
  await repos.guests.setAuthProtection(pia.id, {
    authProtected: true,
    passwordHash: null,
  });
  const hal = await createGuest({ name: "Hal Host" });
  const talk = await createSession(event.id, {
    title: "Talk",
    hostIds: [hal.id],
    locationIds: [room.id],
    startTime: at("15T09:00"),
    endTime: at("15T10:00"),
  });
  const miaRsvp = await repos.rsvps.create({
    sessionId: talk.id,
    guestId: mia.id,
  });
  const piaRsvp = await repos.rsvps.create({
    sessionId: talk.id,
    guestId: pia.id,
  });
  const closed = await createUnavailability(
    event.id,
    room.id,
    at("15T12:00"),
    at("15T13:00")
  );
  const lobby = await repos.meetingPoints.create({
    eventId: event.id,
    name: "Lobby",
    description: "By the door",
    sortIndex: 0,
  });
  const meeting = await repos.meetings.create({
    eventId: event.id,
    requesterId: mia.id,
    recipientId: pia.id,
    slotStart: at("15T11:00"),
    slotEnd: at("15T11:30"),
    meetingPoint: "Lobby",
    message: "Coffee?",
    createdAt: at("14T10:00"),
  });
  await repos.meetingAvailability.replaceForGuest(mia.id, event.id, [
    at("15T11:00"),
  ]);
  await repos.meetingAvailability.replaceForGuest(pia.id, event.id, [
    at("15T11:00"),
    at("15T11:30"),
  ]);
  const labels = new Map<string, string>(
    Object.entries({
      event: event.id,
      day: day.id,
      room: room.id,
      mia: mia.id,
      pia: pia.id,
      hal: hal.id,
      talk: talk.id,
      miaRsvp: miaRsvp.id,
      piaRsvp: piaRsvp.id,
      closed: closed.id,
      lobby: lobby.id,
      meeting: meeting.id,
    }).map(([label, id]) => [id, `<${label}>`])
  );
  return { event, mia, pia, labels };
}

async function snapshotAs(
  w: Awaited<ReturnType<typeof world>>,
  cookie?: string
) {
  const res = await GET(
    new Request(`http://test/api/v1/events/${w.event.slug}/snapshot`, {
      headers: cookie ? { cookie } : {},
    })
  );
  expect(res.status).toBe(200);
  let text = JSON.stringify(await res.json(), null, 2);
  for (const [id, label] of w.labels) text = text.replaceAll(id, label);
  return `${text}\n`;
}

const golden = (viewer: string) => `./golden/snapshot-${viewer}.json`;

describe("GET /api/v1/events/{slug}/snapshot", () => {
  it("gives a visitor with only the site password no `me`", async () => {
    const w = await world();
    await expect(await snapshotAs(w)).toMatchFileSnapshot(
      golden("site-password")
    );
  });

  it("gives an open guest their own data", async () => {
    const w = await world();
    const cookie = `${GUEST_COOKIE_NAME}=${openGuestValue(w.mia.id)}`;
    await expect(await snapshotAs(w, cookie)).toMatchFileSnapshot(
      golden("open-guest")
    );
  });

  it("gives an open cookie naming a protected guest no `me`", async () => {
    const w = await world();
    const cookie = `${GUEST_COOKIE_NAME}=${openGuestValue(w.pia.id)}`;
    await expect(await snapshotAs(w, cookie)).toMatchFileSnapshot(
      golden("open-cookie-protected-guest")
    );
  });

  it("gives a verified guest their own data", async () => {
    const w = await world();
    const cookie = `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(w.pia.id)}`;
    await expect(await snapshotAs(w, cookie)).toMatchFileSnapshot(
      golden("verified-guest")
    );
  });

  it("carries the server's now, the fake clock included", async () => {
    const w = await world();
    const now = async (headers: Record<string, string>) => {
      const res = await GET(
        new Request(`http://test/api/v1/events/${w.event.slug}/snapshot`, {
          headers,
        })
      );
      return ((await res.json()) as { now: string }).now;
    };
    expect(await now({})).toBe("2026-06-15T10:00:00.000Z");

    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
    expect(await now({ cookie: "time-override=3600000" })).toBe(
      "2026-06-15T11:00:00.000Z"
    );
  });

  it("answers an unknown event with event.notFound", async () => {
    const res = await GET(
      new Request("http://test/api/v1/events/nope/snapshot")
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({
      code: "event.notFound",
      detail: "Event not found",
    });
  });
});
