// @module-tag 017-US4
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
  addLocationUnavailabilityAction,
  deleteLocationUnavailabilityAction,
  loginAsAdmin,
  logoutAdmin,
} from "../helpers/admin-api";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createLocation } from "../helpers/factories";
import { getRepositories } from "@/db/container";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

describe("location unavailability actions", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await loginAsAdmin();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("records a period in which a room cannot be booked", async () => {
    const event = await createEvent();
    const room = await createLocation({ eventId: event.id });

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [room.id],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:30",
    });

    expect(result).toEqual({ ok: true });
    expect(
      await getRepositories().locationUnavailability.listByEvent(event.id)
    ).toEqual([
      expect.objectContaining({
        locationId: room.id,
        start: new Date("2026-10-03T12:00:00Z"),
        end: new Date("2026-10-03T13:30:00Z"),
      }),
    ]);
  });

  it("records the same period for several rooms at once", async () => {
    const event = await createEvent();
    const hall = await createLocation({ eventId: event.id });
    const terrace = await createLocation({ eventId: event.id });

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [hall.id, terrace.id],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:30",
    });

    expect(result).toEqual({ ok: true });
    const periods = await getRepositories().locationUnavailability.listByEvent(
      event.id
    );
    expect(periods.map((p) => p.locationId).sort()).toEqual(
      [hall.id, terrace.id].sort()
    );
  });

  it("records nothing when one of the rooms is not part of the event", async () => {
    const event = await createEvent();
    const room = await createLocation({ eventId: event.id });
    const elsewhere = await createLocation();

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [room.id, elsewhere.id],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:00",
    });

    expect(result.ok).toBe(false);
    expect(
      await getRepositories().locationUnavailability.listByEvent(event.id)
    ).toEqual([]);
  });

  it("asks for at least one room", async () => {
    const event = await createEvent();

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:00",
    });

    expect(result).toEqual({ ok: false, error: "Pick at least one room" });
  });

  it("rejects a period that ends before it starts", async () => {
    const event = await createEvent();
    const room = await createLocation({ eventId: event.id });

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [room.id],
      start: "2026-10-03T13:00",
      end: "2026-10-03T12:00",
    });

    expect(result.ok).toBe(false);
    expect(
      await getRepositories().locationUnavailability.listByEvent(event.id)
    ).toEqual([]);
  });

  it("rejects a room that is not part of the event", async () => {
    const event = await createEvent();
    const elsewhere = await createLocation();

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [elsewhere.id],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:00",
    });

    expect(result.ok).toBe(false);
    expect(
      await getRepositories().locationUnavailability.listByEvent(event.id)
    ).toEqual([]);
  });

  it("removes a period again", async () => {
    const event = await createEvent();
    const room = await createLocation({ eventId: event.id });
    await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [room.id],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:00",
    });
    const [period] = await getRepositories().locationUnavailability.listByEvent(
      event.id
    );

    const result = await deleteLocationUnavailabilityAction({ id: period.id });

    expect(result).toEqual({ ok: true });
    expect(
      await getRepositories().locationUnavailability.listByEvent(event.id)
    ).toEqual([]);
  });

  it("turns away anyone who is not an organizer", async () => {
    const event = await createEvent();
    const room = await createLocation({ eventId: event.id });
    logoutAdmin();

    const result = await addLocationUnavailabilityAction({
      eventId: event.id,
      locationIds: [room.id],
      start: "2026-10-03T12:00",
      end: "2026-10-03T13:00",
    });

    expect(result).toEqual({ ok: false, error: "Unauthorized" });
    expect(
      await getRepositories().locationUnavailability.listByEvent(event.id)
    ).toEqual([]);
  });
});
