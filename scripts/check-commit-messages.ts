// Checks commit messages against docs/dev/version-control.md.
//
//     bun scripts/check-commit-messages.ts            # origin/main..HEAD, or trunk()..@ in jj
//     bun scripts/check-commit-messages.ts base..head # a git range, or a jj revset
//     echo "feat: x" | bun scripts/check-commit-messages.ts --stdin

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const usesJj = existsSync(path.join(repoRoot, ".jj"));

const TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
  "deps",
];
const SUBJECT = new RegExp(`^(${TYPES.join("|")})(\\([^)\\s]+\\))?!?: \\S`);
const MAX_SUBJECT = 72;
const MAX_BODY_LINE = 80;
const GENERATED = /^(Merge |Revert "|fixup! |squash! )/;
const DEPENDABOT = /^Signed-off-by: dependabot\[bot\] </m;

export function commitMessageProblems(message: string): string[] {
  if (DEPENDABOT.test(message)) return [];

  const lines = message
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.trimEnd());
  while (lines.at(-1) === "") lines.pop();

  const [subject = "", ...rest] = lines;
  if (GENERATED.test(subject)) return [];

  const problems: string[] = [];
  if (!SUBJECT.test(subject)) {
    problems.push(
      `subject must be "<type>[(scope)][!]: <description>" with type one of ${TYPES.join(", ")}`
    );
  }
  if (subject.length > MAX_SUBJECT) {
    problems.push(`subject is ${subject.length} chars, max ${MAX_SUBJECT}`);
  }
  if (rest.length > 0 && rest[0] !== "") {
    problems.push("second line must be blank");
  }
  rest.forEach((line, i) => {
    const unwrappable = !/\s/.test(line.trim()) || line.includes("://");
    if (line.length > MAX_BODY_LINE && !unwrappable) {
      problems.push(
        `body line ${i + 2} is ${line.length} chars, max ${MAX_BODY_LINE}`
      );
    }
  });
  return problems;
}

function defaultRange(): string {
  if (usesJj) return "trunk()..@";
  const hasOrigin = (() => {
    try {
      git(["rev-parse", "--verify", "--quiet", "origin/main"]);
      return true;
    } catch {
      return false;
    }
  })();
  return `${hasOrigin ? "origin/main" : "main"}..HEAD`;
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", cwd: repoRoot });
}

function jj(args: string[]): string {
  return execFileSync("jj", args, { encoding: "utf8", cwd: repoRoot });
}

function log(range: string): string {
  if (!usesJj)
    return git(["log", "--no-merges", "--format=%h%x00%B%x01", range]);
  // An undescribed @ is work in progress, not yet a commit.
  const revset = `(${range}) ~ merges() ~ (@ & description(exact:""))`;
  const template = 'change_id.short() ++ "\\x00" ++ description ++ "\\x01"';
  return jj(["log", "--no-graph", "-r", revset, "-T", template]);
}

function messagesIn(range: string): { id: string; message: string }[] {
  return log(range)
    .split("\x01")
    .map((entry) => entry.replace(/^\n/, ""))
    .filter((entry) => entry.trim() !== "")
    .map((entry) => {
      const [id, message] = entry.split("\x00");
      return { id, message };
    });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const arg = process.argv[2];
  const commits =
    arg === "--stdin"
      ? [{ id: "stdin", message: readFileSync(0, "utf8") }]
      : messagesIn(arg ?? defaultRange());

  let failed = 0;
  for (const { id, message } of commits) {
    const problems = commitMessageProblems(message);
    if (problems.length === 0) continue;
    failed++;
    console.error(`${id}: ${message.split("\n")[0]}`);
    for (const problem of problems) console.error(`  - ${problem}`);
  }
  if (failed > 0) {
    console.error(
      `\n${failed} commit message(s) break docs/dev/version-control.md`
    );
    process.exit(1);
  }
  console.log(`Checked ${commits.length} commit message(s): ok`);
}
