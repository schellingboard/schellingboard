import type { EventStatistics } from "@schellingboard/contracts/stats";
import {
  parseStatsRef,
  STATS_CELLS,
  STATS_COLUMNS,
  STATS_TITLES,
} from "@schellingboard/domain/stats/text";
import { beforeAll, describe, expect, it } from "vitest";

import { getRepositories, resetRepositories } from "@/db/container";
import { seedTestData } from "@/scripts/seed/seed-database";
import { GET } from "@/tests/helpers/v1-route";

import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { setupTestDb } from "../helpers/db";
import { type EnglishTable, inEnglish } from "../helpers/stats-english";

type Stats = {
  tables: EnglishTable[];
  filterOptions: {
    locations: { id: string; name: string }[];
    hosts: { id: string; name: string }[];
  };
};

let eventId = "";
let cookie = "";

async function rawStats() {
  const res = await GET(
    new Request(`http://test/api/v1/admin/events/${eventId}/stats`, {
      headers: { cookie },
    })
  );
  return (await res.json()) as EventStatistics;
}

async function stats(query = "") {
  const res = await GET(
    new Request(`http://test/api/v1/admin/events/${eventId}/stats${query}`, {
      headers: { cookie },
    })
  );
  expect(res.status).toBe(200);
  return inEnglish(await res.json()) as Stats;
}

const cell = (s: Stats, table: string, label: string) =>
  s.tables.find((t) => t.id === table)?.rows.find((r) => r[0] === label)?.[1];

beforeAll(async () => {
  setupTestDb();
  await seedTestData("large");
  resetRepositories();
  const event = await getRepositories().events.findByName("Web Unconference");
  eventId = event!.id;
  const c = await createAdminAuthCookie();
  cookie = `${c.name}=${c.value}`;
}, 60_000);

describe("the large dev seed", { tags: ["021-US3"] }, () => {
  it("has volunteer shifts that the origin filter takes out", async () => {
    const all = await stats();
    const names = all.filterOptions.locations.map((l) => l.name);
    expect(names).toContain("Volunteers 1");
    expect(names).toContain("Volunteers 2");

    const locationIds = all.filterOptions.locations
      .filter((l) => l.name.startsWith("Volunteers"))
      .map((l) => l.id);
    const organizer = all.filterOptions.hosts.find(
      (h) => h.name === "Olga Organizer"
    );
    expect(organizer).toBeDefined();

    const filtered = await stats(
      `?excludeLocations=${locationIds.join(",")}&excludeHosts=${organizer!.id}`
    );
    const count = (s: Stats, label: string) =>
      cell(s, "overview-headline", label) as number;
    expect(count(all, "Sessions") - count(filtered, "Sessions")).toBe(12);
    expect(count(all, "Members") - count(filtered, "Members")).toBe(1);
  });

  it("has attendee reports on some sessions", async () => {
    const s = await stats();
    expect(
      cell(s, "overview-headline", "Sessions with an attendee report") as number
    ).toBeGreaterThan(0);
  });

  it("sends only ids its text catalog knows", async () => {
    const { tables } = await rawStats();
    expect(tables.length).toBeGreaterThan(20);
    const known = (catalog: object, id: string) => id in catalog;
    for (const table of tables) {
      expect(known(STATS_TITLES, table.titleId), table.titleId).toBe(true);
      table.columns.forEach((column, i) => {
        expect(known(STATS_COLUMNS, column.labelId), column.labelId).toBe(true);
        if (column.type !== "label") return;
        for (const row of table.rows) {
          if (row[i] === null) continue;
          const { id } = parseStatsRef(String(row[i]));
          expect(known(STATS_CELLS, id), `${table.id}: ${id}`).toBe(true);
        }
      });
    }
  });
});
