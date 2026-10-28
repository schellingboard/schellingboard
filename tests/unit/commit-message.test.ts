import { describe, it, expect } from "vitest";
import { commitMessageProblems } from "@/scripts/check-commit-messages";

describe("commitMessageProblems", () => {
  it("accepts a conventional subject", () => {
    expect(commitMessageProblems("feat: add a thing")).toEqual([]);
  });

  it("accepts a scope, a breaking marker and a squash-merge suffix", () => {
    expect(commitMessageProblems("fix(web)!: repair it (#12)")).toEqual([]);
  });

  it("accepts the dependency-bot type", () => {
    expect(commitMessageProblems("deps(deps): bump node")).toEqual([]);
  });

  it("rejects a subject without a standard prefix", () => {
    expect(commitMessageProblems("Add a thing")).toHaveLength(1);
    expect(commitMessageProblems("feature: add a thing")).toHaveLength(1);
    expect(commitMessageProblems("feat:no space")).toHaveLength(1);
  });

  it("rejects a subject over 72 characters", () => {
    const subject = `feat: ${"x".repeat(67)}`;
    expect(subject).toHaveLength(73);
    expect(commitMessageProblems(subject)).toHaveLength(1);
    expect(commitMessageProblems(subject.slice(1))).toHaveLength(1);
    expect(commitMessageProblems(`feat: ${"x".repeat(66)}`)).toEqual([]);
  });

  it("requires a blank line between subject and body", () => {
    expect(commitMessageProblems("feat: a\nbody")).toHaveLength(1);
    expect(commitMessageProblems("feat: a\n\nbody")).toEqual([]);
  });

  it("rejects a body line over 80 characters", () => {
    const long = "word ".repeat(17).trim();
    expect(long).toHaveLength(84);
    expect(commitMessageProblems(`feat: a\n\n${long}`)).toHaveLength(1);
    expect(
      commitMessageProblems(`feat: a\n\n${"word ".repeat(16).trim()}`)
    ).toEqual([]);
  });

  it("allows a long body line without whitespace, such as a URL", () => {
    const url = `https://example.com/${"a".repeat(100)}`;
    expect(commitMessageProblems(`feat: a\n\nSee ${url}`)).toEqual([]);
    expect(commitMessageProblems(`feat: a\n\n${"a".repeat(100)}`)).toEqual([]);
    expect(commitMessageProblems(`feat: a\n\n${url}`)).toEqual([]);
    expect(commitMessageProblems(`feat: a\n\n[1]: ${url}`)).toEqual([]);
  });

  it("allows a long line that wraps around a URL", () => {
    const line = `Details are at https://example.com/${"a".repeat(80)} today`;
    expect(commitMessageProblems(`feat: a\n\n${line}`)).toEqual([]);
  });

  it("ignores comment lines and trailing newlines", () => {
    expect(commitMessageProblems("feat: a\n\nbody\n# ignored\n")).toEqual([]);
  });

  it("skips merge and fixup commits", () => {
    expect(commitMessageProblems("Merge branch 'x' into main")).toEqual([]);
    expect(commitMessageProblems('Revert "feat: a"')).toEqual([]);
  });
});
