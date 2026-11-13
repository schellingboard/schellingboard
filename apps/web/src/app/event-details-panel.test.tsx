import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { open, running } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

const withText = {
  ...running,
  event: { ...running.event, description: "Bring **a mug**." },
};

describe("the event details panel", { tags: ["007-US6"] }, () => {
  it("opens from the toolbar over the schedule and closes back to it", async () => {
    const { router } = await open({
      path: "/conf/schedule",
      snapshot: withText,
    });

    await userEvent.click(
      await screen.findByRole("button", { name: "Event details" })
    );

    const panel = await screen.findByRole("dialog", { name: "Event details" });
    expect(within(panel).getByText("a mug").tagName).toBe("STRONG");
    expect(within(panel).getByText(/Jun 15 · UTC/)).toBeTruthy();
    expect(router.history.location.pathname).toBe("/conf/details");

    await userEvent.click(within(panel).getByRole("button", { name: "Close" }));
    await vi.waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/schedule")
    );
  });

  it("opens from its own address over the schedule", async () => {
    const { router } = await open({
      path: "/conf/details",
      snapshot: withText,
    });

    const panel = await screen.findByRole("dialog", { name: "Event details" });
    expect(within(panel).getByText("a mug")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Grid", pressed: true })
    ).toBeTruthy();
    expect(router.history.location.pathname).toBe("/conf/details");
  });
});
