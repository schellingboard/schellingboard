import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DevToolbar } from "./dev-toolbar";

const HOUR = 3_600_000;
const NOW = Date.parse("2026-10-09T10:00:00Z");
const clear = () => (document.cookie = "time-override=; path=/; max-age=0");

function show(search = "?dev=1", enabled = true) {
  const onChange = vi.fn();
  const sendReminders = vi.fn(() => Promise.resolve("sent 2 reminders"));
  render(
    <DevToolbar
      enabled={enabled}
      search={search}
      clock={() => NOW}
      onChange={onChange}
      sendReminders={sendReminders}
    />
  );
  return { onChange, sendReminders, user: userEvent.setup() };
}

describe("DevToolbar", () => {
  afterEach(clear);

  it("stays hidden unless dev tools are on and ?dev=1 is in the URL", () => {
    show("", true);
    show("?dev=1", false);
    expect(screen.queryByRole("region", { name: "Dev clock" })).toBeNull();
  });

  it("shows the simulated time", () => {
    document.cookie = `time-override=${2 * HOUR}; path=/`;
    show();
    expect(
      screen.getByRole("region", { name: "Dev clock" }).textContent
    ).toContain("2026-10-09 12:00 UTC");
  });

  it("moves the clock by writing the cookie and telling the shell", async () => {
    const { onChange, user } = show();

    await user.click(screen.getByRole("button", { name: "+1h" }));
    await user.click(screen.getByRole("button", { name: "+1d" }));

    expect(document.cookie).toContain(`time-override=${HOUR + 24 * HOUR}`);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("goes back to real time by clearing the cookie", async () => {
    document.cookie = `time-override=${HOUR}; path=/`;
    const { onChange, user } = show();

    await user.click(screen.getByRole("button", { name: "Real time" }));

    expect(document.cookie).not.toContain("time-override");
    expect(onChange).toHaveBeenCalled();
  });

  it("jumps to a picked date and time", () => {
    const { onChange } = show();
    const picker =
      screen.getByLabelText<HTMLInputElement>("Pick date and time");

    fireEvent.change(picker, { target: { value: "2026-10-10T10:00" } });

    const offset = Number(/time-override=(-?\d+)/.exec(document.cookie)?.[1]);
    expect(
      Math.abs(
        offset - (Date.parse(new Date(2026, 9, 10, 10).toISOString()) - NOW)
      )
    ).toBeLessThan(1);
    expect(onChange).toHaveBeenCalled();
  });

  it("sends the due reminders and says how many went out", async () => {
    const { sendReminders, user } = show();

    await user.click(
      screen.getByRole("button", { name: "Send due reminders" })
    );

    expect(sendReminders).toHaveBeenCalled();
    expect((await screen.findByRole("status")).textContent).toBe(
      "sent 2 reminders"
    );
  });

  it("can be dismissed", async () => {
    const { user } = show();
    await user.click(
      screen.getByRole("button", { name: "Dismiss dev clock toolbar" })
    );
    expect(screen.queryByRole("region", { name: "Dev clock" })).toBeNull();
  });
});
