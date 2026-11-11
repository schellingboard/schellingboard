import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./combobox";

function Harness({ onLink }: { onLink: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <a
        href="#elsewhere"
        onClick={(e) => {
          e.preventDefault();
          onLink();
        }}
      >
        Elsewhere
      </a>
      <Combobox
        label="Pronouns"
        value={value}
        onChange={setValue}
        options={["she/her", "he/him"]}
      />
    </div>
  );
}

describe("Combobox", { tags: ["011-US1"] }, () => {
  it("closes on a tap outside without activating what was tapped", async () => {
    const onLink = vi.fn();
    const user = userEvent.setup();
    render(<Harness onLink={onLink} />);
    const input = screen.getByRole("combobox", { name: "Pronouns" });

    await user.click(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");

    const link = screen.getByRole("link", { name: "Elsewhere" });
    fireEvent.pointerDown(link, { pointerType: "touch" });
    fireEvent.click(link);

    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).not.toBe(input);
    expect(onLink).not.toHaveBeenCalled();

    await user.click(link);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it("lets a mouse click through to what it hit", async () => {
    const onLink = vi.fn();
    const user = userEvent.setup();
    render(<Harness onLink={onLink} />);
    await user.click(screen.getByRole("combobox", { name: "Pronouns" }));

    const link = screen.getByRole("link", { name: "Elsewhere" });

    fireEvent.pointerDown(link, { pointerType: "mouse" });
    fireEvent.click(link);

    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it("does not eat the next tap after a cancelled touch", async () => {
    const onLink = vi.fn();
    const user = userEvent.setup();
    render(<Harness onLink={onLink} />);
    await user.click(screen.getByRole("combobox", { name: "Pronouns" }));
    const link = screen.getByRole("link", { name: "Elsewhere" });

    fireEvent.pointerDown(link, { pointerType: "touch" });
    fireEvent.pointerCancel(link, { pointerType: "touch" });
    fireEvent.click(link);

    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it("still takes a tapped suggestion", async () => {
    const user = userEvent.setup();
    render(<Harness onLink={() => {}} />);
    const input = screen.getByRole("combobox", { name: "Pronouns" });

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "he/him" }));

    expect(input).toHaveProperty("value", "he/him");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});
