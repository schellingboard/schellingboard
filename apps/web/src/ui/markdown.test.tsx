import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./markdown";

describe("Markdown", () => {
  it("renders paragraphs, lists and inline spans", () => {
    render(
      <Markdown>
        {"First **bold** and _soft_.\n\n- one\n- two with `code`\n\nSecond"}
      </Markdown>
    );
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("soft").tagName).toBe("EM");
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      ["one", "two with code"]
    );
    expect(screen.getByText("Second").tagName).toBe("P");
  });

  it("links web addresses only", () => {
    render(
      <Markdown>
        {"[docs](https://x.org/a) [bad](javascript:alert(1))"}
      </Markdown>
    );
    const link = screen.getByRole("link", { name: "docs" });
    expect(link.getAttribute("href")).toBe("https://x.org/a");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.queryByRole("link", { name: "bad" })).toBeNull();
    expect(screen.getByText(/bad/)).toBeTruthy();
  });
});
