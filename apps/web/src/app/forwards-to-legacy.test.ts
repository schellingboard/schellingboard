import { describe, expect, it } from "vitest";
import { scheduleStaysInLegacy } from "./forwards-to-legacy";

describe("scheduleStaysInLegacy", () => {
  it("is false for the plain schedule, whatever view, filter or rooms", () => {
    expect(scheduleStaysInLegacy("?view=agenda&filter=mine&loc=Aula", "")).toBe(
      false
    );
    expect(scheduleStaysInLegacy("", "theme=dark; other=1")).toBe(false);
  });

  it("is true while a session or 1-on-1 modal is asked for", () => {
    expect(scheduleStaysInLegacy("?viewSession=s1", "")).toBe(true);
    expect(scheduleStaysInLegacy("?view=agenda&viewMeeting=m1", "")).toBe(true);
  });

  it("is true for kiosk mode, asked for or remembered", () => {
    expect(scheduleStaysInLegacy("?kiosk=1", "")).toBe(true);
    expect(scheduleStaysInLegacy("?kiosk=0", "")).toBe(true);
    expect(scheduleStaysInLegacy("", "a=1; kiosk=1")).toBe(true);
  });
});
