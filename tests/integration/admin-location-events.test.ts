// @module-tag 017-US3
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import {
  assignLocationsToEventAction,
  loginAsAdmin,
  logoutAdmin,
  removeLocationsFromEventAction,
} from "../helpers/admin-api";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createLocation } from "../helpers/factories";
import { getRepositories } from "@/db/container";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

describe("assignLocationsToEventAction", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await loginAsAdmin();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("assigns locations to an event", async () => {
    const event = await createEvent();
    const l1 = await createLocation();
    const l2 = await createLocation();

    const result = await assignLocationsToEventAction({
      eventId: event.id,
      locationIds: [l1.id, l2.id],
    });
    expect(result.ok).toBe(true);

    const repos = getRepositories();
    expect(await repos.locations.listEventIds(l1.id)).toContain(event.id);
    expect(await repos.locations.listEventIds(l2.id)).toContain(event.id);
  });

  it("is idempotent and preserves other event assignments", async () => {
    const eventA = await createEvent();
    const eventB = await createEvent();
    const l1 = await createLocation();
    const repos = getRepositories();
    await repos.locations.setEventIds(l1.id, [eventB.id]);

    await assignLocationsToEventAction({
      eventId: eventA.id,
      locationIds: [l1.id],
    });
    // re-assign — no error, no duplicate
    await assignLocationsToEventAction({
      eventId: eventA.id,
      locationIds: [l1.id],
    });

    const eventIds = await repos.locations.listEventIds(l1.id);
    expect(eventIds.sort()).toEqual([eventA.id, eventB.id].sort());
  });

  it("rejects when not authenticated", async () => {
    const event = await createEvent();
    const l1 = await createLocation();
    logoutAdmin();

    const result = await assignLocationsToEventAction({
      eventId: event.id,
      locationIds: [l1.id],
    });
    expect(!result.ok && result.error).toBe("Unauthorized");
  });

  it("errors for unknown event", async () => {
    const l1 = await createLocation();
    const result = await assignLocationsToEventAction({
      eventId: "no-such-event",
      locationIds: [l1.id],
    });
    expect(!result.ok && result.error).toBe("Event not found");
  });

  it("accepts duplicate location ids", async () => {
    const event = await createEvent();
    const l1 = await createLocation();

    const result = await assignLocationsToEventAction({
      eventId: event.id,
      locationIds: [l1.id, l1.id],
    });
    expect(result.ok).toBe(true);
    expect(await getRepositories().locations.listEventIds(l1.id)).toContain(
      event.id
    );
  });

  it("errors if any location id does not exist", async () => {
    const event = await createEvent();
    const l1 = await createLocation();
    const result = await assignLocationsToEventAction({
      eventId: event.id,
      locationIds: [l1.id, "no-such-location"],
    });
    expect(!result.ok && result.error).toBe("Location not found");
    // ensure nothing was written
    expect(await getRepositories().locations.listEventIds(l1.id)).toEqual([]);
  });
});

describe("removeLocationsFromEventAction", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await loginAsAdmin();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("removes locations from an event, leaving other assignments intact", async () => {
    const eventA = await createEvent();
    const eventB = await createEvent();
    const l1 = await createLocation();
    const repos = getRepositories();
    await repos.locations.setEventIds(l1.id, [eventA.id, eventB.id]);

    const result = await removeLocationsFromEventAction({
      eventId: eventA.id,
      locationIds: [l1.id],
    });
    expect(result.ok).toBe(true);

    expect(await repos.locations.listEventIds(l1.id)).toEqual([eventB.id]);
  });

  it("is a no-op for unassigned locations", async () => {
    const event = await createEvent();
    const l1 = await createLocation();

    const result = await removeLocationsFromEventAction({
      eventId: event.id,
      locationIds: [l1.id],
    });
    expect(result.ok).toBe(true);
    expect(await getRepositories().locations.listEventIds(l1.id)).toEqual([]);
  });

  it("rejects when not authenticated", async () => {
    const event = await createEvent();
    const l1 = await createLocation();
    logoutAdmin();

    const result = await removeLocationsFromEventAction({
      eventId: event.id,
      locationIds: [l1.id],
    });
    expect(!result.ok && result.error).toBe("Unauthorized");
  });

  it("errors for unknown event", async () => {
    const l1 = await createLocation();
    const result = await removeLocationsFromEventAction({
      eventId: "no-such-event",
      locationIds: [l1.id],
    });
    expect(!result.ok && result.error).toBe("Event not found");
  });
});
