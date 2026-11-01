// @module-tag 002-US1
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createLocation,
  createDay,
  slotStart,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

// Creating requires a name to actually be selected: an absent guest cookie
// claims nothing, so nothing is verified.
describe("creation requires a selected name", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    vi.stubEnv("SITE_PASSWORD", "site-pw");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("booking a session refuses a caller with no name selected", async () => {
    const { addSession } = await import("../helpers/session-form");
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest({ eventId: event.id });
    const location = await createLocation({ eventId: event.id });
    const day = await createDay(event.id);

    const res = await addSession(
      new Request("http://test/session-form", {
        method: "POST",
        body: JSON.stringify({
          title: "T",
          description: "",
          closed: false,
          hosts: [guest],
          location,
          dayId: day.id,
          startTime: slotStart(day, 60),
          duration: 60,
        }),
      })
    );

    expect(res.status).toBe(403);
    expect(
      await getRepositories().sessions.listHostedByGuest(guest.id)
    ).toEqual([]);
  });
});
