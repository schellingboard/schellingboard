// @module-tag 012-US2
import { Settings } from "luxon";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { slotDayHeadings } from "./slot-day-headings";

const day = (id: string, start: string, end: string) => ({
  id,
  start,
  end,
});

describe("slotDayHeadings", () => {
  const before = Settings.defaultLocale;
  beforeEach(() => {
    Settings.defaultLocale = "en-GB";
  });
  afterEach(() => {
    Settings.defaultLocale = before;
  });

  it("names a day by its date in the format locale", () => {
    const days = [day("a", "2026-10-02T08:00:00Z", "2026-10-02T16:00:00Z")];
    expect(slotDayHeadings(days, "UTC")[0]).toBe("Fri 2 Oct");
    Settings.defaultLocale = "de";
    expect(slotDayHeadings(days, "UTC")[0]).toBe("Fr., 2. Okt.");
  });

  it("adds the window to days that share a date", () => {
    const days = [
      day("a", "2026-10-02T08:00:00Z", "2026-10-02T10:00:00Z"),
      day("b", "2026-10-02T14:00:00Z", "2026-10-02T18:00:00Z"),
    ];
    const headings = slotDayHeadings(days, "UTC");
    expect(headings[0]).toBe("Fri 2 Oct, 08:00–10:00");
    expect(headings[1]).toBe("Fri 2 Oct, 14:00–18:00");
  });
});
