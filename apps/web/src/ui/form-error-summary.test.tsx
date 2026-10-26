// @module-tag 009-US1
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormErrorSummary } from "./form-error-summary";

describe("FormErrorSummary", () => {
  it("shows nothing without errors", () => {
    render(<FormErrorSummary fields={{}} error={null} onJump={() => {}} />);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("lists every field error and jumps to the field of the one pressed", async () => {
    const onJump = vi.fn();
    render(
      <FormErrorSummary
        fields={{ title: "Title is required", cohostWantedNote: "Too long" }}
        error={null}
        onJump={onJump}
      />
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("There are 2 problems to fix:");
    await userEvent.click(screen.getByRole("button", { name: "Too long" }));
    expect(onJump).toHaveBeenCalledWith("cohostWantedNote");
  });

  it("names a failed save without asking the person to fix anything", () => {
    render(
      <FormErrorSummary
        fields={{}}
        error="This might not have been saved."
        onJump={() => {}}
      />
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "There is a problem:"
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
