import { describe, expect, it } from "vitest";
import type { AdminSession } from "../../queries/admin-sessions";
import {
  CAPACITY_ERROR,
  EMPTY_SESSION,
  sessionBody,
  sessionFormValues,
  type DayOption,
} from "./admin-session-model";

const TZ = "Europe/Berlin";
const day: DayOption = {
  key: "d1",
  label: "Wednesday, May 1",
  start: "2030-05-01T07:00:00.000Z",
  end: "2030-05-01T17:00:00.000Z",
};

const session = (extra: Partial<AdminSession> = {}): AdminSession => ({
  id: "s1",
  title: "Talk",
  description: "",
  startTime: "2030-05-01T08:00:00.000Z",
  endTime: "2030-05-01T09:00:00.000Z",
  capacity: 12,
  adminManaged: false,
  blocker: false,
  closed: false,
  hosts: [{ id: "g1", name: "Alice" }],
  locations: [{ id: "l1", name: "Hall" }],
  numRsvps: 0,
  version: 1,
  ...extra,
});

describe("the admin session form model", { tags: ["018-US2"] }, () => {
  it("shows a scheduled session on its event day, in the event's zone", () => {
    const { values, days } = sessionFormValues(session(), [day], TZ);

    expect(values).toMatchObject({
      dayKey: "d1",
      startTime: "10:00",
      endTime: "11:00",
      capacity: "12",
      hostIds: ["g1"],
      locationIds: ["l1"],
    });
    expect(days).toEqual([day]);
  });

  it("keeps a date outside the event's days as an extra option", () => {
    const { values, days } = sessionFormValues(
      session({
        startTime: "2030-06-01T08:00:00.000Z",
        endTime: "2030-06-01T09:00:00.000Z",
      }),
      [day],
      TZ
    );

    expect(values.dayKey).toBe("other");
    expect(days.at(-1)?.label).toBe("2030-06-01 (not an event day)");
  });

  it("leaves an unscheduled session without a day", () => {
    const { values } = sessionFormValues(
      session({ startTime: null, endTime: null }),
      [day],
      TZ
    );

    expect(values).toMatchObject({ dayKey: "", startTime: "", endTime: "" });
  });

  it("turns an empty capacity into 0", () => {
    const { body } = sessionBody(
      {
        ...EMPTY_SESSION,
        title: "T",
        dayKey: "d1",
        startTime: "10:00",
        endTime: "11:00",
        capacity: "",
      },
      [day],
      TZ
    );

    expect(body).toMatchObject({ capacity: 0 });
  });

  it("starts after the break when asked", () => {
    const { body } = sessionBody(
      {
        ...EMPTY_SESSION,
        dayKey: "d1",
        startTime: "10:00",
        endTime: "11:00",
        capacity: "0",
      },
      [day],
      TZ,
      10
    );

    expect(body?.startTime).toBe("2030-05-01T08:10:00.000Z");
  });

  it("sends no times for an unscheduled session", () => {
    const { body } = sessionBody({ ...EMPTY_SESSION, capacity: "3" }, [], TZ);

    expect(body).toMatchObject({ startTime: null, endTime: null, capacity: 3 });
  });

  it("names a missing time and a bad capacity instead of building a body", () => {
    const missing = sessionBody({ ...EMPTY_SESSION, dayKey: "d1" }, [day], TZ);
    expect(missing.body).toBeUndefined();
    expect(missing.errors).toMatchObject({
      startTime: "Start is required",
      endTime: "End is required",
    });

    const bad = sessionBody({ ...EMPTY_SESSION, capacity: "2.5" }, [], TZ);
    expect(bad.errors.capacity).toBe(CAPACITY_ERROR);
  });
});
