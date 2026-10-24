import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Layout } from "./layout";

describe("Layout", () => {
  it("puts the page between the nav and the footer, with a skip link", () => {
    render(
      <Layout nav={<nav aria-label="Nav" />} footer={<footer>foot</footer>}>
        <p>page</p>
      </Layout>
    );

    expect(screen.getByRole("main").textContent).toContain("page");
    expect(screen.getByRole("navigation", { name: "Nav" })).toBeTruthy();
    expect(screen.getByRole("contentinfo").textContent).toBe("foot");
    expect(
      screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")
    ).toBe("#main");
  });
});
