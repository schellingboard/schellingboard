import { describe, expect, it } from "vitest";

import { formatDuration } from "./duration";

describe("formatDuration", () => {
  it("short", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h 30m");
  });
  it("long", () => {
    expect(formatDuration(1, true)).toBe("1 minute");
    expect(formatDuration(45, true)).toBe("45 minutes");
    expect(formatDuration(60, true)).toBe("1 hour");
    expect(formatDuration(120, true)).toBe("2 hours");
    expect(formatDuration(90, true)).toBe("1 hour 30 minutes");
  });
});
