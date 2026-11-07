import { beforeAll, describe, expect, it } from "vitest";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { getRepositories, resetRepositories } from "@/db/container";
import { seedTestData } from "@/scripts/seed/seed-database";
import { GET } from "@/tests/helpers/v1-route";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { setupTestDb } from "../helpers/db";

type Stats = {
  tables: StatsTable[];
  filterOptions: {
    locations: { id: string; name: string }[];
    hosts: { id: string; name: string }[];
  };
};

let eventId = "";
let cookie = "";

async function stats(query = "") {
  const res = await GET(
    new Request(`http://test/api/v1/admin/events/${eventId}/stats${query}`, {
      headers: { cookie },
    })
  );
  expect(res.status).toBe(200);
  return (await res.json()) as Stats;
}

const cell = (s: Stats, table: string, label: string) =>
  s.tables.find((t) => t.id === table)?.rows.find((r) => r[0] === label)?.[1];

beforeAll(async () => {
  setupTestDb();
  await seedTestData("large");
  resetRepositories();
  const event = await getRepositories().events.findByName("Conference Gamma");
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
});
