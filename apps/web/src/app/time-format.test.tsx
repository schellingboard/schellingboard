import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TimeFormatProvider,
  TimeFormatSelect,
  readTimeFormatCookie,
  useTimeFormat,
} from "./time-format";

const clear = () => {
  document.cookie = "sb-time-format=; path=/; max-age=0";
};

function Probe() {
  return <p data-testid="format">{useTimeFormat()}</p>;
}

const renderBoth = () =>
  render(
    <TimeFormatProvider>
      <TimeFormatSelect />
      <Probe />
    </TimeFormatProvider>
  );

describe("time format", () => {
  beforeEach(clear);
  afterEach(clear);

  it("is Automatic without a cookie or with a bad one @014-US7", () => {
    document.cookie = "sb-time-format=sometimes; path=/";
    expect(readTimeFormatCookie()).toBe("auto");
  });

  it("persists a choice in the cookie and applies it @014-US7", async () => {
    const user = userEvent.setup();
    renderBoth();
    await user.click(screen.getByRole("button", { name: "12-hour" }));
    expect(screen.getByTestId("format").textContent).toBe("h:mm a");
    expect(document.cookie).toContain("sb-time-format=12h");
    await user.click(screen.getByRole("button", { name: "24-hour" }));
    expect(screen.getByTestId("format").textContent).toBe("HH:mm");
  });
});
