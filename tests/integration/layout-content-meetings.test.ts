// @module-tag 012-US5
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// The event layout seeds the viewer's 1-on-1s into the server render, so the
// grid draws its 1-on-1 column from the start instead of shifting the rooms
// once a client fetch lands.

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

const captured: { myMeetings?: unknown } = {};
vi.mock("@/app/(site)/[eventSlug]/event-provider-wrapper", () => ({
  EventProviderWrapper: ({
    eventContextValue,
  }: {
    eventContextValue: { myMeetings: unknown };
  }) => {
    captured.myMeetings = eventContextValue.myMeetings;
    return "PROVIDER_STUB";
  },
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest, createEvent } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

async function renderLayout(eventSlug: string): Promise<void> {
  const { EventLayoutContent } =
    await import("@/app/(site)/[eventSlug]/layout-content");
  renderToStaticMarkup(await EventLayoutContent({ eventSlug, children: null }));
}

describe("event layout seeds the viewer's 1-on-1s", () => {
  beforeAll(() => setupTestDb());

  beforeEach(() => {
    resetTestDb();
    cookieJar.clear();
    captured.myMeetings = undefined;
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("seeds the selected guest's declared slots", async () => {
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest({ eventId: event.id });
    const slot = new Date("2030-01-01T10:00:00Z");
    await getRepositories().meetingAvailability.replaceForGuest(
      guest.id,
      event.id,
      [slot]
    );
    cookieJar.set(GUEST_COOKIE_NAME, await verifiedGuestValue(guest.id));

    await renderLayout(event.slug);

    expect(captured.myMeetings).toEqual({
      guestId: guest.id,
      meetings: [],
      availability: [slot.toISOString()],
    });
  });

  it("seeds nothing without a selected guest", async () => {
    const event = await createEvent({ phase: "scheduling" });

    await renderLayout(event.slug);

    expect(captured.myMeetings).toBeNull();
  });
});
