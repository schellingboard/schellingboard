// Fast checks for the last change; `make prepush` runs everything. The last
// change is @ in jj (@- when @ is empty), in git the uncommitted changes (HEAD
// when there are none). See docs/dev/version-control.md.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const E2E = /^tests\/e2e\//;
const E2E_SPEC = /^tests\/e2e\/.*\.spec\.ts$/;
const GLOBALS_MUTATING_SPEC = /(^|\/)settings\.spec\.ts$/;

// Changes whose effect no per-file selection can follow.
const RUN_EVERYTHING = [
  /(^|\/)package\.json$/,
  /^bun\.lock$/,
  /^Makefile$/,
  /^eslint\.config\.mjs$/,
  /^\.prettier(rc|ignore)$/,
  /^\.dependency-cruiser\.cjs$/,
  /(^|\/)tsconfig[^/]*\.json$/,
  /(^|\/)vitest\.config\.ts$/,
  /^playwright\.config\.ts$/,
  /^set-env\.ts$/,
  /^\.env\.test$/,
  /^tests\/(setup|global-setup)\.ts$/,
  /^apps\/web\/src\/test-setup\.ts$/,
  /^drizzle\//,
];

export interface PrecommitPlan {
  full: boolean;
  format: string[];
  lint: string[];
  related: string[];
  e2e: "all" | { specs: string[]; globalsSpecs: string[] };
}

export function precommitPlan(files: string[]): PrecommitPlan {
  const code = files.filter((file) => CODE.test(file));
  const specs = files.filter((file) => E2E_SPEC.test(file));
  const sharedE2e = files.some((f) => E2E.test(f) && !E2E_SPEC.test(f));
  return {
    full: files.some((file) => RUN_EVERYTHING.some((re) => re.test(file))),
    format: files,
    lint: code,
    related: code.filter((file) => !E2E.test(file)),
    e2e: sharedE2e
      ? "all"
      : {
          specs: specs.filter((file) => !GLOBALS_MUTATING_SPEC.test(file)),
          globalsSpecs: specs.filter((file) =>
            GLOBALS_MUTATING_SPEC.test(file)
          ),
        },
  };
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
  const plan = precommitPlan(files);
  console.log(`Checking ${files.length} file(s) changed in ${label}`);

  if (plan.full) {
    console.log("Tooling or test setup changed: running make prepush");
    run("make", ["prepush"]);
    process.exit(0);
  }

  if (plan.format.length > 0) {
    run("bun", [
      "x",
      "prettier",
      "--write",
      "--ignore-unknown",
      ...plan.format,
    ]);
  }
  if (plan.lint.length > 0) {
    run(
      "bun",
      ["x", "eslint", "--max-warnings", "0", "--no-warn-ignored", ...plan.lint],
      { NODE_OPTIONS: "--max-old-space-size=8192" }
    );
  }
  run("make", ["-s", "typecheck", "arch", "openapi-check"]);
  if (plan.related.length > 0) {
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
