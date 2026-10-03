import { describe, it, expect } from "vitest";
import { features, useCases } from "@/tests/use-cases";
import { listE2eTests, summarise, type TaggedTest } from "@/scripts/use-cases";

function tagged(
  tier: TaggedTest["tier"],
  title: string,
  tags: string[]
): TaggedTest {
  return { tier, file: `${title}.ts`, line: 1, title, tags };
}

describe("use case catalogue", () => {
  it("numbers features and their user stories like a feature spec", () => {
    for (const [feature, { slug, stories }] of Object.entries(features)) {
      expect(feature).toMatch(/^\d{3}$/);
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      for (const story of Object.keys(stories)) {
        expect(story).toMatch(/^US\d+[a-z]?$/);
      }
    }
  });

  it("gives every feature a slug of its own", () => {
    const slugs = Object.values(features).map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every E2E test covers at least one catalogued use case", () => {
    const { untagged, unknown } = summarise(useCases, listE2eTests());
    const offenders = [
      ...untagged.e2e.map((t) => `${t.file}:${t.line} ${t.title}`),
      ...unknown.map(({ test, id }) => `${test.file}:${test.line} ${id}`),
    ];
    expect(
      offenders,
      "End each E2E test title with the use cases it covers, e.g. " +
        '"votes on a proposal @005-US1", adding missing ones to tests/use-cases.ts'
    ).toEqual([]);
  });
});

describe("use case summary", () => {
  const catalogue = useCases.filter((u) =>
    ["001-US1", "001-US2", "001-US3"].includes(u.id)
  );

  it("counts the tests covering each use case per tier", () => {
    const { rows } = summarise(catalogue, [
      tagged("e2e", "a", ["001-US1"]),
      tagged("e2e", "b", ["001-US1", "001-US2"]),
      tagged("integration", "c", ["001-US1"]),
    ]);
    expect(rows.map((r) => [r.useCase.id, r.counts])).toEqual([
      ["001-US1", { e2e: 2, integration: 1, unit: 0 }],
      ["001-US2", { e2e: 1, integration: 0, unit: 0 }],
      ["001-US3", { e2e: 0, integration: 0, unit: 0 }],
    ]);
  });

  it("lists use cases no test covers", () => {
    const { uncovered } = summarise(catalogue, [
      tagged("unit", "a", ["001-US2"]),
    ]);
    expect(uncovered.map((u) => u.id)).toEqual(["001-US1", "001-US3"]);
  });

  it("does not count planned or deprecated use cases as uncovered", () => {
    const [planned, deprecated, active] = catalogue;
    const { uncovered } = summarise(
      [
        { ...planned, status: "planned" },
        { ...deprecated, status: "deprecated" },
        active,
      ],
      []
    );
    expect(uncovered.map((u) => u.id)).toEqual([active.id]);
  });

  it("reports IDs missing from the catalogue, ignoring other tags", () => {
    const test = tagged("integration", "a", ["001-US9", "slow"]);
    const { unknown } = summarise(catalogue, [test]);
    expect(unknown).toEqual([{ test, id: "001-US9" }]);
  });

  it("lists untagged tests per tier", () => {
    const untaggedE2e = tagged("e2e", "a", []);
    const { untagged } = summarise(catalogue, [
      untaggedE2e,
      tagged("integration", "b", ["slow"]),
      tagged("integration", "c", ["001-US1"]),
    ]);
    expect(untagged.e2e).toEqual([untaggedE2e]);
    expect(untagged.integration.map((t) => t.title)).toEqual(["b"]);
    expect(untagged.unit).toEqual([]);
  });
});
