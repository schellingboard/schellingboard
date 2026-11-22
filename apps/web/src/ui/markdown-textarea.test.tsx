// @module-tag 004-US1
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { MarkdownTextarea } from "./markdown-textarea";

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <label htmlFor="d">Description</label>
      <MarkdownTextarea id="d" value={value} onChange={setValue} />
    </>
  );
}

describe("MarkdownTextarea", () => {
  it("edits plain text", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText("Description"), "hello");

    expect(
      screen.getByLabelText<HTMLTextAreaElement>("Description").value
    ).toBe("hello");
  });

  it("previews the rendered text and goes back to editing without losing it", async () => {
    render(<Harness initial="Learn **Rust**" />);

    await userEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.getByText("Rust").tagName).toBe("STRONG");

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByLabelText<HTMLTextAreaElement>("Description").value
    ).toBe("Learn **Rust**");
  });

  it("formats the selection from the toolbar and with a shortcut", async () => {
    render(<Harness initial="hello world" />);
    const box = screen.getByLabelText<HTMLTextAreaElement>("Description");

    box.setSelectionRange(6, 11);
    await userEvent.click(screen.getByRole("button", { name: /^Bold/ }));
    expect(box.value).toBe("hello **world**");

    box.setSelectionRange(0, 5);
    box.focus();
    await userEvent.keyboard("{Control>}i{/Control}");
    expect(box.value).toBe("*hello* **world**");
  });

  it("is one Tab stop for the whole toolbar, with arrow keys inside it", async () => {
    render(
      <>
        <input aria-label="Title" />
        <Harness />
      </>
    );
    const edit = screen.getByRole("button", { name: "Edit" });
    const preview = screen.getByRole("button", { name: "Preview" });
    const box = screen.getByLabelText("Description");
    screen.getByLabelText("Title").focus();

    await userEvent.tab();
    expect(document.activeElement).toBe(edit);
    await userEvent.tab();
    expect(document.activeElement).toBe(box);

    await userEvent.tab({ shift: true });
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(preview);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /^Insert link/ })
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(box);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /^Insert link/ })
    );
  });
});
