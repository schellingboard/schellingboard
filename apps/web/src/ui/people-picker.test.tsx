// @module-tag 004-US2
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PeopleField } from "./form";

const PEOPLE = [
  { id: "a", name: "Alice Test" },
  { id: "b", name: "Bob Test" },
  { id: "c", name: "Élodie Durand" },
];

function Harness({
  initial = [],
  onChange = () => {},
}: {
  initial?: string[];
  onChange?: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState(initial);
  return (
    <PeopleField
      label="Host(s)"
      people={PEOPLE}
      selected={selected}
      onChange={(ids) => {
        setSelected(ids);
        onChange(ids);
      }}
    />
  );
}

describe("PeopleField", () => {
  it("adds a person picked from the list and shows them as a chip", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Host(s)"));
    await userEvent.click(screen.getByRole("option", { name: /Alice Test/ }));

    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    expect(
      screen.getByRole("button", { name: "Remove Alice Test" })
    ).toBeTruthy();
  });

  it("removes a person with their chip's button", async () => {
    const onChange = vi.fn();
    render(<Harness initial={["a", "b"]} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Alice Test" })
    );

    expect(onChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("filters by typing, ignoring accents, and picks with the keyboard", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Host(s)"), "elodie");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Élodie Durand",
    ]);
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("unpicks a selected person from the list and closes on Escape", async () => {
    const onChange = vi.fn();
    render(<Harness initial={["a"]} onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Host(s)"));
    await userEvent.click(screen.getByRole("option", { name: /Alice Test/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("says when nothing matches", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText("Host(s)"), "zzz");

    expect(screen.getByText("Nothing found.")).toBeTruthy();
  });
});
