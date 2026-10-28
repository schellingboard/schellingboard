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

  it("links bare web addresses and e-mails, and keeps mailto and tel links", () => {
    render(
      <Markdown>
        {"See https://bees.example.com/a, mail me@x.org or [call](tel:+4712)."}
      </Markdown>
    );
    expect(
      screen
        .getByRole("link", { name: "https://bees.example.com/a" })
        .getAttribute("href")
    ).toBe("https://bees.example.com/a");
    expect(
      screen.getByRole("link", { name: "me@x.org" }).getAttribute("href")
    ).toBe("mailto:me@x.org");
    const call = screen.getByRole("link", { name: "call" });
    expect(call.getAttribute("href")).toBe("tel:+4712");
    expect(call.getAttribute("target")).toBeNull();
  });

  it("renders numbered lists, quotes and a list straight after a paragraph", () => {
    render(
      <Markdown>{"Intro\n- a\n- b\n\n1. one\n2. two\n\n> quoted"}</Markdown>
    );
    expect(screen.getAllByRole("list").map((l) => l.tagName)).toEqual([
      "UL",
      "OL",
    ]);
    expect(screen.getByText("Intro").tagName).toBe("P");
    expect(screen.getByText("quoted").tagName).toBe("BLOCKQUOTE");
  });

  it("links www addresses and parenthesised ones, and keeps a link inside bold", () => {
    render(
      <Markdown>
        {
          "www.example.com, https://en.wikipedia.org/wiki/Bee_(insect). **[x](https://y.org)**"
        }
      </Markdown>
    );
    expect(
      screen.getByRole("link", { name: "www.example.com" }).getAttribute("href")
    ).toBe("https://www.example.com");
    expect(
      screen
        .getByRole("link", {
          name: "https://en.wikipedia.org/wiki/Bee_(insect)",
        })
        .getAttribute("href")
    ).toBe("https://en.wikipedia.org/wiki/Bee_(insect)");
    expect(screen.getByRole("link", { name: "x" }).parentElement?.tagName).toBe(
      "STRONG"
    );
  });

  it("renders a heading line as bold text, even straight after a paragraph", () => {
    render(<Markdown>{"Intro\n## Topics\nafter"}</Markdown>);
    expect(screen.getByText("Topics").className).toContain("font-bold");
    expect(screen.getByText("Intro").tagName).toBe("P");
  });
});
