// @module-tag 009-US1
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CheckboxField,
  DateTimeField,
  SelectField,
  TextAreaField,
  TextField,
} from "./form";

describe("form fields", () => {
  it("label a text input and mark a required one", () => {
    render(<TextField label="Title" required value="" onChange={() => {}} />);

    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: /Title/,
    });
    expect(input.required).toBe(true);
  });

  it("report typing", async () => {
    const onChange = vi.fn();
    render(<TextField label="Title" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Title"), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("tie an error to its input as an alert", () => {
    render(
      <TextField
        label="Title"
        value=""
        onChange={() => {}}
        error="Title is required"
      />
    );

    const input = screen.getByLabelText("Title");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Title is required");
    expect(input.getAttribute("aria-describedby")).toContain(alert.id);
  });

  it("show a hint the input is described by", () => {
    render(
      <TextAreaField
        label="About"
        hint="Markdown supported"
        value=""
        onChange={() => {}}
      />
    );

    const hint = screen.getByText("Markdown supported");
    expect(
      screen.getByLabelText("About").getAttribute("aria-describedby")
    ).toContain(hint.id);
  });

  it("let a select pick an option", async () => {
    const onChange = vi.fn();
    render(
      <SelectField
        label="Room"
        value="a"
        onChange={onChange}
        options={[
          { value: "a", label: "Hall" },
          { value: "b", label: "Annex" },
        ]}
      />
    );

    await userEvent.selectOptions(screen.getByLabelText("Room"), "Annex");

    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("toggle a checkbox", async () => {
    const onChange = vi.fn();
    render(
      <CheckboxField
        label="Looking for a co-host"
        checked={false}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Looking for a co-host" })
    );

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("use the native input for a date, a time and a date and time", () => {
    render(
      <>
        <DateTimeField kind="date" label="Day" value="" onChange={() => {}} />
        <DateTimeField kind="time" label="Start" value="" onChange={() => {}} />
        <DateTimeField
          kind="datetime-local"
          label="Opens"
          value=""
          onChange={() => {}}
        />
      </>
    );

    expect(screen.getByLabelText("Day").getAttribute("type")).toBe("date");
    expect(screen.getByLabelText("Start").getAttribute("type")).toBe("time");
    expect(screen.getByLabelText("Opens").getAttribute("type")).toBe(
      "datetime-local"
    );
  });
});
