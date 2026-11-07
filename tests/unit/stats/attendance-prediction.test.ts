import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  type PredictionConfidence,
  type PredictionInput,
  meanInterestShare,
  predictAttendance,
  rangeCovers,
} from "@schellingboard/domain/stats/attendance-prediction";

type Row = {
  min: number;
  max: number;
  mid: number;
  total: number;
  interested: number;
};

const csv = readFileSync(
  path.join(__dirname, "../../../docs/dev/attendance-model/data-2025.csv"),
  "utf8"
)
  .trim()
  .split("\n")
  .slice(1);
const rows: Row[] = csv.map((line) => {
  const c = line.split(",");
  return {
    min: Number(c[1]),
    max: Number(c[2]),
    mid: Number(c[3]),
    total: Number(c[5]),
    interested: Number(c[6]),
  };
});
const shares = rows.map((r) => r.interested / r.total);
const event = {
  attendees: 259,
  parallel: 9,
  meanShare: meanInterestShare(shares),
};

function predict(input: PredictionInput, conf: PredictionConfidence) {
  const prediction = predictAttendance(input, conf);
  if (!prediction) throw new Error("expected a prediction");
  return prediction;
}

const caught = (conf: PredictionConfidence) =>
  rows.filter((r) => {
    const p = predict(
      { ...event, share: r.interested / r.total, voters: r.total },
      conf
    );
    return rangeCovers(p, { min: r.min, max: r.max });
  }).length;

describe("attendance prediction", { tags: ["021-US4"] }, () => {
  it("has the 2025 mean interest share of 0.27", () => {
    expect(event.meanShare).toBeCloseTo(0.27, 2);
  });

  it("reproduces the look-up table of the write-up", () => {
    const at = (share: number, conf: PredictionConfidence) => {
      const p = predict({ ...event, share, voters: 103 }, conf);
      return [Math.round(p.low), Math.round(p.high)];
    };
    expect(at(0.25, 0.5)).toEqual([12, 26]);
    expect(at(0.25, 0.8)).toEqual([8, 38]);
    expect(at(0.5, 0.8)).toEqual([17, 74]);
  });

  it("reproduces the calibration: 62% and 77% of the sessions caught", () => {
    expect(caught(0.5)).toBe(8);
    expect(caught(0.8)).toBe(10);
  });

  it("widens the range with fewer voters but keeps the midpoint", () => {
    const few = predict({ ...event, share: 0.27, voters: 10 }, 0.8);
    const many = predict({ ...event, share: 0.27, voters: 259 }, 0.8);
    expect(few.mid).toBeCloseTo(many.mid, 9);
    expect(few.high / few.low).toBeGreaterThan(many.high / many.low);
    expect(Math.round(few.low)).toBe(7);
    expect(Math.round(many.high)).toBe(40);
  });

  it("gives no prediction for a share of zero or no voters", () => {
    expect(
      predictAttendance({ ...event, share: 0, voters: 50 }, 0.5)
    ).toBeNull();
    expect(
      predictAttendance({ ...event, share: 0.3, voters: 0 }, 0.5)
    ).toBeNull();
    expect(
      predictAttendance({ ...event, meanShare: 0, share: 0.3, voters: 5 }, 0.5)
    ).toBeNull();
  });
});
