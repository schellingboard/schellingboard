/**
 * Which tests claim to cover which use case in tests/use-cases.ts.
 *
 *   make use-cases
 *
 * Lists the tests without running them and prints a markdown report: coverage
 * per use case and tier, uncovered use cases, unknown IDs and untagged tests.
 * The counts are what tests declare, not what they exercise.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectSpecs, specTitle, type JsonReport } from "./playwright-json";
import { useCases, type CatalogueEntry } from "../tests/use-cases";

const TIERS = ["e2e", "integration", "unit"] as const;
type Tier = (typeof TIERS)[number];

export interface TaggedTest {
  tier: Tier;
  file: string;
  line: number;
  title: string;
  tags: string[];
}

export interface Summary {
  rows: { useCase: CatalogueEntry; counts: Record<Tier, number> }[];
  uncovered: CatalogueEntry[];
  unknown: { test: TaggedTest; id: string }[];
  untagged: Record<Tier, TaggedTest[]>;
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const USE_CASE_TAG = /^\d{3}-US\d+[a-z]?$/;

function relative(file: string): string {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

export function listE2eTests(): TaggedTest[] {
  const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
  const result = spawnSync(
    process.execPath,
    [cli, "test", "--list", "--reporter=json"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    throw new Error(`playwright test --list failed:\n${result.stderr}`);
  }
  const report = JSON.parse(result.stdout) as JsonReport;
  const rootDir = report.config?.rootDir ?? path.join(ROOT, "tests/e2e");
  return collectSpecs(report.suites ?? []).map((collected) => ({
    tier: "e2e",
    file: relative(path.join(rootDir, collected.spec.file ?? "")),
    line: collected.spec.line ?? 0,
    title: specTitle(collected),
    tags: (collected.spec.tags ?? []).map((tag) => tag.replace(/^@/, "")),
  }));
}

async function listVitestTests(): Promise<TaggedTest[]> {
  const { createVitest } = await import("vitest/node");
  const vitest = await createVitest("test", { watch: false });
  try {
    const { testModules } = await vitest.collect();
    return testModules.flatMap((module) => {
      const file = relative(module.moduleId);
      const tier: Tier = file.startsWith("tests/unit/")
        ? "unit"
        : "integration";
      return [...module.children.allTests()].map((test) => ({
        tier,
        file,
        line: test.location?.line ?? 0,
        title: test.fullName,
        tags: [...test.tags],
      }));
    });
  } finally {
    await vitest.close();
  }
}

export function summarise(
  catalogue: CatalogueEntry[],
  tests: TaggedTest[]
): Summary {
  const counts = new Map(
    catalogue.map((u) => [u.id as string, { e2e: 0, integration: 0, unit: 0 }])
  );
  const unknown: Summary["unknown"] = [];
  const untagged: Summary["untagged"] = { e2e: [], integration: [], unit: [] };

  for (const test of tests) {
    const ids = test.tags.filter((tag) => USE_CASE_TAG.test(tag));
    if (ids.length === 0) untagged[test.tier].push(test);
    for (const id of ids) {
      const count = counts.get(id);
      if (count) count[test.tier]++;
      else unknown.push({ test, id });
    }
  }

  const rows = catalogue.map((useCase) => ({
    useCase,
    counts: counts.get(useCase.id)!,
  }));
  return {
    rows,
    uncovered: rows
      .filter(
        ({ useCase, counts }) =>
          !useCase.status && TIERS.every((tier) => counts[tier] === 0)
      )
      .map(({ useCase }) => useCase),
    unknown,
    untagged,
  };
}

// Pruning candidates: E2E tests are meant to be few (docs/dev/testing.md).
const MANY_E2E_TESTS = 5;

function renderReport({ rows, uncovered, unknown, untagged }: Summary): string {
  const active = rows.filter(({ useCase }) => !useCase.status);
  const covered = (tier: Tier) =>
    active.filter(({ counts }) => counts[tier] > 0).length;
  const out = [
    "# Use case coverage",
    "",
    `${active.length} use cases: ${covered("e2e")} covered by E2E, ` +
      `${covered("integration")} by integration, ${covered("unit")} by unit tests. ` +
      `Untagged: ${TIERS.map((t) => `${untagged[t].length} ${t}`).join(", ")}.`,
    "",
    "| ID | Use case | Actor | Priority | Component | E2E | Integration | Unit |",
    "| --- | --- | --- | --- | --- | --: | --: | --: |",
    ...rows.map(
      ({ useCase: u, counts: c }) =>
        `| ${u.id} | ${u.title}${u.status ? ` (${u.status})` : ""} | ${u.actor} | ` +
        `${u.priority} | ${u.component} | ${c.e2e} | ${c.integration} | ${c.unit} |`
    ),
  ];
  const section = (title: string, lines: string[]) => {
    if (lines.length > 0) out.push("", `## ${title}`, "", ...lines);
  };
  section(
    "Uncovered",
    uncovered.map((u) => `- ${u.id} ${u.title} (${u.priority})`)
  );
  section(
    `Covered by ${MANY_E2E_TESTS} or more E2E tests`,
    rows
      .filter(({ counts }) => counts.e2e >= MANY_E2E_TESTS)
      .sort((a, b) => b.counts.e2e - a.counts.e2e)
      .map(({ useCase: u, counts }) => `- ${u.id} ${u.title}: ${counts.e2e}`)
  );
  section(
    "Unknown IDs",
    unknown.map(({ test, id }) => `- ${id} in ${test.file}:${test.line}`)
  );
  section(
    "Untagged E2E tests",
    untagged.e2e.map((t) => `- ${t.file}:${t.line} ${t.title}`)
  );
  return out.join("\n") + "\n";
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const tests = [...listE2eTests(), ...(await listVitestTests())];
  process.stdout.write(renderReport(summarise(useCases, tests)));
}
