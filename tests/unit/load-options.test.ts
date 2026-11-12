import { describe, expect, it } from "vitest";
import {
  parseDuration,
  parseOptions,
  pickWeighted,
} from "@/scripts/load/options";

describe("parseDuration", () => {
  it.each([
    ["90", 90_000],
    ["45s", 45_000],
    ["15m", 900_000],
    ["2h", 7_200_000],
  ])("reads %s", (text, ms) => {
    expect(parseDuration(text)).toBe(ms);
  });

  it.each(["", "m", "-5s", "1d", "abc", "0"])("refuses %j", (text) => {
    expect(() => parseDuration(text)).toThrow(/duration/i);
  });
});

describe("parseOptions", () => {
  it("has defaults for a manual run", () => {
    expect(parseOptions([])).toMatchObject({
      users: 1000,
      durationMs: 900_000,
      check: false,
      build: true,
    });
  });

  it("reads flags with a space or an equals sign", () => {
    expect(
      parseOptions([
        "--users",
        "200",
        "--duration=60s",
        "--check",
        "--no-build",
      ])
    ).toMatchObject({
      users: 200,
      durationMs: 60_000,
      check: true,
      build: false,
    });
  });

  it("keeps the report path", () => {
    expect(parseOptions(["--report", "out.json"]).report).toBe("out.json");
  });

  it("refuses unknown flags and bad user counts", () => {
    expect(() => parseOptions(["--bogus"])).toThrow(/--bogus/);
    expect(() => parseOptions(["--users", "0"])).toThrow(/users/);
    expect(() => parseOptions(["--users", "many"])).toThrow(/users/);
    expect(() => parseOptions(["--users", "1021"])).toThrow(/users/);
  });
});

describe("pickWeighted", () => {
  const weights = { read: 90, write: 8, comment: 2 };

  it("maps the unit interval onto the weights", () => {
    expect(pickWeighted(weights, 0)).toBe("read");
    expect(pickWeighted(weights, 0.899)).toBe("read");
    expect(pickWeighted(weights, 0.9)).toBe("write");
    expect(pickWeighted(weights, 0.979)).toBe("write");
    expect(pickWeighted(weights, 0.98)).toBe("comment");
    expect(pickWeighted(weights, 0.9999)).toBe("comment");
  });
});
