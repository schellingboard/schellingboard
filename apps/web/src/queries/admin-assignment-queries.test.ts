import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminGuestsQuery } from "./admin-guests";
import { createAdminLocationsQuery } from "./admin-locations";
import { createAdminUnavailabilityQuery } from "./admin-unavailability";

const guest = (id: string) => ({
  id,
  name: `Guest ${id}`,
  email: `${id}@x.org`,
  authProtected: false,
  eventIds: ["e1"],
  version: 1,
});

describe("the admin guests query", { tags: ["016-US3"] }, () => {
  it("reads every page of guests", async () => {
    const { api, calls } = fakeApi((call) =>
      call.path.includes("cursor=c1")
        ? Response.json({ items: [guest("g2")], nextCursor: null })
        : Response.json({ items: [guest("g1")], nextCursor: "c1" })
    );
    const query = createAdminGuestsQuery({ api });

    await query.load();

    expect(calls).toHaveLength(2);
    expect(query.get()).toEqual({
      status: "ready",
      guests: [
        {
          id: "g1",
          name: "Guest g1",
          email: "g1@x.org",
          eventIds: ["e1"],
          version: 1,
        },
        {
          id: "g2",
          name: "Guest g2",
          email: "g2@x.org",
          eventIds: ["e1"],
          version: 1,
        },
      ],
    });
  });
});

describe("the admin locations query", { tags: ["017-US3"] }, () => {
  it("reads the locations with their events", async () => {
    const hall = {
      id: "l1",
      name: "Hall",
      description: "Big",
      areaDescription: null,
      capacity: 20,
      color: "blue",
      bookable: true,
      imageUrl: "/media/hall.png",
      eventIds: ["e1"],
      version: 3,
    };
    const { api } = fakeApi(() =>
      Response.json({
        locations: [{ ...hall, sortIndex: 0, sessionCount: 2 }],
      })
    );
    const query = createAdminLocationsQuery({ api });

    await query.load();

    expect(query.get()).toEqual({
      status: "ready",
      locations: [{ ...hall, sessionCount: 2 }],
    });
  });
});

describe("the admin unavailability query", { tags: ["017-US4"] }, () => {
  it("reads an event's unavailable periods and reports a refusal", async () => {
    const period = {
      id: "u1",
      eventId: "e1",
      locationId: "l1",
      start: "2030-05-01T07:00:00.000Z",
      end: "2030-05-01T09:00:00.000Z",
    };
    const ok = fakeApi(() => Response.json({ periods: [period] }));
    const query = createAdminUnavailabilityQuery({
      api: ok.api,
      eventId: "e1",
    });
    await query.load();
    expect(ok.calls[0].path).toBe(
      "/api/v1/admin/events/e1/location-unavailability"
    );
    expect(query.get()).toEqual({
      status: "ready",
      periods: [
        {
          id: "u1",
          locationId: "l1",
          start: period.start,
          end: period.end,
        },
      ],
    });

    const denied = fakeApi(() => problem(403, "admin.required"));
    const failing = createAdminUnavailabilityQuery({
      api: denied.api,
      eventId: "e1",
    });
    await failing.load();
    expect(failing.get()).toEqual({ status: "error", code: "admin.required" });
  });
});
