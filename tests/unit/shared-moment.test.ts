import { describe, expect, it } from "vitest";
import type { SharedMoment } from "@schellingboard/domain/event";
import { overlappingMoment } from "@schellingboard/domain/shared-moment";

const at = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 5, 15, hour, minute));

const moment = (id: string, start: Date, end: Date): SharedMoment => ({
  id,
  dayId: "d",
  title: id,
  description: "",
  start,
  end,
});

describe("overlappingMoment", { tags: ["007-US15"] }, () => {
  const lunch = moment("Lunch", at(12, 30), at(14));
  const coffee = moment("Coffee", at(15), at(15, 30));

  it("finds the moment a session runs into", () => {
    expect(overlappingMoment([coffee, lunch], at(11), at(13))).toBe(lunch);
    expect(overlappingMoment([lunch], at(13), at(13, 30))).toBe(lunch);
    expect(overlappingMoment([lunch], at(13, 30), at(15))).toBe(lunch);
  });

  it("ignores a session that only touches a moment", () => {
    expect(overlappingMoment([lunch], at(11), at(12, 30))).toBeUndefined();
    expect(overlappingMoment([lunch], at(14), at(15))).toBeUndefined();
  });

  it("takes the earliest of several", () => {
    expect(overlappingMoment([coffee, lunch], at(13), at(16))).toBe(lunch);
  });
});
