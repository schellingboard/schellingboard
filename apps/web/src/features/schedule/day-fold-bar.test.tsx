import { render, screen } from "@testing-library/react";
import { Settings } from "luxon";
import { afterEach, describe, expect, it } from "vitest";

import { DayFoldBar } from "./day-fold-bar";

describe("DayFoldBar", { tags: ["022-US1"] }, () => {
  const before = Settings.defaultLocale;
  afterEach(() => {
    Settings.defaultLocale = before;
  });

  it("names the day in the format locale's word order", () => {
    Settings.defaultLocale = "de";
    render(
      <DayFoldBar
        day={{ start: new Date("2026-06-13T10:00:00Z") }}
        timezone="UTC"
        folded={false}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText("Samstag, 13. Juni")).toBeTruthy();
  });
});
