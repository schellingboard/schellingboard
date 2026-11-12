import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { formatDayLabel, formatSlotLabel } from "@schellingboard/domain/time";

const at = (iso: string) => DateTime.fromISO(iso, { zone: "utc" }).toJSDate();

describe("time format", () => {
  it("is used by slot and day labels when given @014-US7", () => {
    const dayStart = at("2026-06-13T09:00:00Z");
    expect(
      formatSlotLabel(at("2026-06-13T14:00:00Z"), dayStart, "UTC", "h:mm a")
    ).toBe("2:00 PM");
    expect(
      formatDayLabel(
        { start: dayStart, end: at("2026-06-14T03:00:00Z") } as never,
        "UTC",
        "h:mm a"
      )
    ).toBe("Saturday, June 13 (until 3:00 AM Sun)");
  });
});
