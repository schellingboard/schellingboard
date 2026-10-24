import { describe, expect, it } from "vitest";
import { scheduleStaysInLegacy } from "./forwards-to-legacy";

describe("scheduleStaysInLegacy", () => {
  it("is false for the plain schedule, whatever view, filter or rooms", () => {
    expect(scheduleStaysInLegacy("?view=agenda&filter=mine&loc=Aula")).toBe(
      false
    );
    expect(scheduleStaysInLegacy("")).toBe(false);
  });

  it("is true while a session or 1-on-1 modal is asked for", () => {
    expect(scheduleStaysInLegacy("?viewSession=s1")).toBe(true);
    expect(scheduleStaysInLegacy("?view=agenda&viewMeeting=m1")).toBe(true);
  });

  it("is false for kiosk mode, which the SPA shows itself", () => {
    expect(scheduleStaysInLegacy("?kiosk=1")).toBe(false);
  });
});
