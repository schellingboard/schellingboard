// Fast checks for the last change; `make prepush` runs everything. The last
// change is @ in jj (@- when @ is empty), in git the uncommitted changes (HEAD
// when there are none). See docs/dev/version-control.md.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const E2E = /^tests\/e2e\//;
const E2E_SPEC = /^tests\/e2e\/.*\.spec\.ts$/;
const GLOBALS_MUTATING_SPEC = /(^|\/)settings\.spec\.ts$/;

// Changes whose effect no per-file selection can follow, by the check they
// affect.
const RUN_EVERYTHING = [/^Makefile$/];
const DEPENDENCIES = [/(^|\/)package\.json$/, /^bun\.lock$/];
const FORMAT_ALL = [/^\.prettier(rc|ignore)$/];
const LINT_ALL = [/^eslint\.config\.mjs$/, ...DEPENDENCIES];
const TEST_ALL = [
  ...DEPENDENCIES,
  /(^|\/)tsconfig[^/]*\.json$/,
  /(^|\/)vitest\.config\.ts$/,
  /^set-env\.ts$/,
  /^\.env\.test$/,
  /^tests\/(setup|global-setup)\.ts$/,
  /^apps\/web\/src\/test-setup\.ts$/,
  /^drizzle\//,
];
const E2E_ALL = [
  /^playwright\.config\.ts$/,
  /^set-env\.ts$/,
  /^\.env\.test$/,
  /^tests\/e2e\/init\.ts$/,
];

export interface PrecommitPlan {
  full: boolean;
  formatAll: boolean;
  lintAll: boolean;
  testAll: boolean;
  format: string[];
  lint: string[];
  related: string[];
  e2e: "all" | { specs: string[]; globalsSpecs: string[] };
}

// `e2eImports` maps each E2E file to the local files it imports.
export function precommitPlan(
  files: string[],
  e2eImports: Record<string, string[]> = {}
): PrecommitPlan {
  const any = (patterns: RegExp[]) =>
    files.some((file) => patterns.some((re) => re.test(file)));
  const code = files.filter((file) => CODE.test(file));
  const specs = e2eSpecsUsing(files, e2eImports);
  return {
    full: any(RUN_EVERYTHING),
    formatAll: any(FORMAT_ALL),
    lintAll: any(LINT_ALL),
    testAll: any(TEST_ALL),
    format: files,
    lint: code,
    related: code.filter((file) => !E2E.test(file)),
    e2e: any(E2E_ALL)
      ? "all"
      : {
          specs: specs.filter((file) => !GLOBALS_MUTATING_SPEC.test(file)),
          globalsSpecs: specs.filter((file) =>
            GLOBALS_MUTATING_SPEC.test(file)
          ),
        },
  };
}

function e2eSpecsUsing(
  changed: string[],
  imports: Record<string, string[]>
): string[] {
  const affected = new Set(changed);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [file, deps] of Object.entries(imports)) {
      if (!affected.has(file) && deps.some((dep) => affected.has(dep))) {
        affected.add(file);
        grew = true;
      }
    }
  }
  return [...affected].filter((file) => E2E_SPEC.test(file)).sort();
}

const LOCAL_IMPORT = /from\s+["'](\.{1,2}\/[^"']+)["']/g;

export function e2eImportGraph(): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  const files = readdirSync(path.join(repoRoot, "tests/e2e"), {
    recursive: true,
    encoding: "utf8",
  }).map((file) => `tests/e2e/${file.split(path.sep).join("/")}`);
  for (const file of files) {
    if (!file.endsWith(".ts")) continue;
    const source = readFileSync(path.join(repoRoot, file), "utf8");
    graph[file] = [...source.matchAll(LOCAL_IMPORT)].map(([, spec]) =>
      path.posix.join(path.posix.dirname(file), spec).replace(/(\.ts)?$/, ".ts")
    );
  }
  return graph;
}

function lines(command: string, args: string[]): string[] {
  return execFileSync(command, args, { encoding: "utf8", cwd: repoRoot })
    .split("\n")
    .filter((line) => line !== "");
}

function changedFiles(): { label: string; files: string[] } {
  let label: string;
  let files: string[];
  if (existsSync(path.join(repoRoot, ".jj"))) {
    const [empty] = lines("jj", [
      "log",
      "-r",
      "@",
      "--no-graph",
      "-T",
      "empty",
    ]);
    label = empty === "true" ? "jj @-" : "jj @";
    files = lines("jj", ["diff", "--name-only", "-r", label.slice(3)]);
  } else {
    files = [
      ...lines("git", ["diff", "--name-only", "HEAD"]),
      ...lines("git", ["ls-files", "--others", "--exclude-standard"]),
    ];
    label = "git uncommitted changes";
    if (files.length === 0) {
      label = "git HEAD";
      files = lines("git", [
        "diff-tree",
        "--no-commit-id",
        "--name-only",
        "-r",
        "--root",
        "HEAD",
      ]);
    }
  }
  const existing = files.filter((file) =>
    existsSync(path.join(repoRoot, file))
  );
  return { label, files: [...new Set(existing)] };
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  const { status } = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (status !== 0) process.exit(status ?? 1);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { label, files } = changedFiles();
  const plan = precommitPlan(files, e2eImportGraph());
  console.log(`Checking ${files.length} file(s) changed in ${label}`);

  if (plan.full) {
    console.log("The Makefile changed: running make prepush");
    run("make", ["prepush"]);
    process.exit(0);
  }

  if (plan.formatAll) {
    run("make", ["-s", "format"]);
  } else if (plan.format.length > 0) {
    run("bun", [
      "x",
      "prettier",
      "--write",
      "--ignore-unknown",
      ...plan.format,
    ]);
  }
  if (plan.lintAll) {
    run("make", ["-s", "lint"]);
  } else if (plan.lint.length > 0) {
    run(
      "bun",
      ["x", "eslint", "--max-warnings", "0", "--no-warn-ignored", ...plan.lint],
      { NODE_OPTIONS: "--max-old-space-size=8192" }
    );
  }
  run("make", ["-s", "typecheck", "arch", "openapi-check", "i18n-check"]);
  if (plan.testAll) {
    run("make", ["-s", "test"]);
  } else if (plan.related.length > 0) {
    run("bun", [
      ...["set-env.ts", "test", "bun", "x", "vitest", "related", "--run"],
      ...["--passWithNoTests", ...plan.related],
    ]);
  }

  const playwright = ["set-env.ts", "test", "bun", "x", "playwright", "test"];
  if (plan.e2e === "all") {
    run("bun", playwright);
  } else {
    const { specs, globalsSpecs } = plan.e2e;
    if (specs.length > 0) {
      run("bun", [...playwright, "--project=firefox", ...specs]);
    }
    if (globalsSpecs.length > 0) {
      run("bun", [
        ...playwright,
        ...["--project=firefox-globals", "--no-deps", ...globalsSpecs],
      ]);
    }
  }
}
