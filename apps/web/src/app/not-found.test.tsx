import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { createAppRouter } from "./router";

describe("the catch-all route", () => {
  it("says the page does not exist and links to the events", async () => {
    const router = createAppRouter(
      createMemoryHistory({ initialEntries: ["/conf/kiosk?x=p1"] })
    );
    await router.load();
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Page not found.")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /Back to the events/ })
        .getAttribute("href")
    ).toBe("/");
  });
});
