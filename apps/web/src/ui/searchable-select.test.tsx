import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SearchableSelect } from "./searchable-select";

const OPTIONS = [
  { value: "", label: "Select a location" },
  { value: "a", label: "Main hall" },
  { value: "b", label: "Library" },
  { value: "c", label: "Attic", disabled: true },
];

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <SearchableSelect
        label="Location"
        value={value}
        onChange={setValue}
        options={OPTIONS}
      />
      <output>{value}</output>
    </div>
  );
}

describe("SearchableSelect", { tags: ["008-US1"] }, () => {
  it("shows the selected label and filters the list as you type", async () => {
    const user = userEvent.setup();
    render(<Harness initial="a" />);
    const input = screen.getByRole<HTMLInputElement>("combobox", {
      name: "Location",
    });
    expect(input.value).toBe("Main hall");

    await user.clear(input);
    await user.type(input, "LIB");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Library",
    ]);
  });

  it("gives the value, not the label, of the chosen option", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("combobox", { name: "Location" }));
    await user.click(screen.getByRole("option", { name: "Library" }));
    expect(screen.getByRole("status").textContent).toBe("b");
    expect(
      screen.getByRole<HTMLInputElement>("combobox", { name: "Location" }).value
    ).toBe("Library");
  });

  it("picks with the keyboard and restores the label when left unmatched", async () => {
    const user = userEvent.setup();
    render(<Harness initial="a" />);
    const input = screen.getByRole<HTMLInputElement>("combobox", {
      name: "Location",
    });
    await user.clear(input);
    await user.type(input, "zzz");
    await user.tab();
    expect(input.value).toBe("Main hall");
    expect(screen.getByRole("status").textContent).toBe("a");

    await user.click(input);
    await user.keyboard("{Escape}");
    await user.clear(input);
    await user.type(input, "lib{ArrowDown}{Enter}");
    expect(screen.getByRole("status").textContent).toBe("b");
  });

  it("lists disabled options but cannot pick or arrow onto them", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Location" });
    await user.click(input);
    const attic = screen.getByRole("option", { name: "Attic" });
    expect(attic.getAttribute("aria-disabled")).toBe("true");

    await user.click(attic);
    expect(screen.getByRole("status").textContent).toBe("");

    await user.keyboard("{ArrowUp}{Enter}");
    expect(screen.getByRole("status").textContent).toBe("b");
  });

  it("tells equal labels apart by position", async () => {
    const user = userEvent.setup();
    const twins = [
      { value: "x", label: "Sam" },
      { value: "y", label: "Sam" },
    ];
    function Twins() {
      const [value, setValue] = useState("");
      return (
        <div>
          <SearchableSelect
            label="Who"
            value={value}
            onChange={setValue}
            options={twins}
          />
          <output>{value}</output>
        </div>
      );
    }
    render(<Twins />);
    await user.click(screen.getByRole("combobox", { name: "Who" }));
    await user.click(screen.getAllByRole("option", { name: "Sam" })[1]);
    expect(screen.getByRole("status").textContent).toBe("y");
  });

  it("keeps the empty option out of the list when there is a placeholder", async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        label="Where"
        value=""
        onChange={() => {}}
        options={OPTIONS}
        placeholder="Select a location"
      />
    );
    await user.click(screen.getByRole("combobox", { name: "Where" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Main hall",
      "Library",
      "Attic",
    ]);
  });
});
