import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import {
  createAdminStatsQuery,
  filterFromParams,
  filterToParams,
  statsDownloadUrl,
} from "./admin-stats";

const none = { excludeLocations: [], excludeHosts: [], excludeOrigins: [] };

describe("the statistics filter in the address", { tags: ["021-US3"] }, () => {
  it("leaves out blockers when the address says nothing", () => {
    expect(filterFromParams(new URLSearchParams())).toEqual({
      excludeLocations: [],
      excludeHosts: [],
      excludeOrigins: ["blocker"],
    });
  });

  it("reads the lists, and an empty origin list as no origin", () => {
    const params = new URLSearchParams(
      "excludeLocations=l1,l2&excludeHosts=g1&excludeOrigins="
    );
    expect(filterFromParams(params)).toEqual({
      excludeLocations: ["l1", "l2"],
      excludeHosts: ["g1"],
      excludeOrigins: [],
    });
  });

  it("writes only what differs from the default", () => {
    expect(filterToParams({ ...none, excludeOrigins: ["blocker"] })).toEqual({
      excludeLocations: null,
      excludeHosts: null,
      excludeOrigins: null,
    });
    expect(filterToParams({ ...none, excludeLocations: ["l1", "l2"] })).toEqual(
      {
        excludeLocations: "l1,l2",
        excludeHosts: null,
        excludeOrigins: "",
      }
    );
  });

  it("builds the download address with the filter", () => {
    expect(statsDownloadUrl("e1", "stats.zip", none)).toBe(
      "/api/v1/admin/events/e1/stats.zip?excludeOrigins="
    );
    expect(
      statsDownloadUrl("e1", "stats/overview-funnel.csv", {
        ...none,
        excludeLocations: ["l1"],
        excludeOrigins: ["blocker"],
      })
    ).toBe(
      "/api/v1/admin/events/e1/stats/overview-funnel.csv?excludeLocations=l1"
    );
  });
});

describe("the statistics query", { tags: ["021-US1"] }, () => {
  const body = {
    event: { id: "e1", name: "Conf", slug: "conf" },
    filterSummary: "Excluding blockers",
    filterOptions: { locations: [], hosts: [] },
    tables: [],
  };

  it("loads with the filter and holds the figures", async () => {
    const { api, calls } = fakeApi(() => Response.json(body));
    const query = createAdminStatsQuery({
      api,
      eventId: "e1",
      filter: { ...none, excludeHosts: ["g1"], excludeOrigins: ["blocker"] },
    });
    expect(query.get()).toEqual({ status: "loading" });

    await query.load();

    expect(calls[0].path).toBe("/api/v1/admin/events/e1/stats?excludeHosts=g1");
    expect(query.get()).toEqual({ status: "ready", stats: body });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(403, "admin.required"));
    const query = createAdminStatsQuery({ api, eventId: "e1", filter: none });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "admin.required" });
  });
});
