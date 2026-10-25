// @module-tag 006-US2
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoticeProvider } from "./notices";
import { Unavailable } from "./unavailable";

afterEach(cleanup);

function setup(blocked: boolean, why: string) {
  const onClick = vi.fn();
  render(
    <NoticeProvider>
      <Unavailable blocked={blocked} why={why}>
        <button onClick={onClick}>Vote</button>
      </Unavailable>
    </NoticeProvider>
  );
  return { onClick, button: screen.getByRole("button", { name: "Vote" }) };
}

describe("Unavailable", () => {
  it("describes the control by the reason and says it on activation", async () => {
    const { button, onClick } = setup(true, "Voting opens soon");

    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("aria-describedby")).toBeTruthy();
    expect(
      document.getElementById(button.getAttribute("aria-describedby")!)!
        .textContent
    ).toBe("Voting opens soon");
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain(
      "Voting opens soon"
    );
  });

  it("stays inert and silent when there is no reason to give", async () => {
    const { button, onClick } = setup(true, "");

    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("aria-describedby")).toBeNull();
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("leaves an available control alone", async () => {
    const { button, onClick } = setup(false, "unused");

    expect(button.getAttribute("aria-disabled")).toBeNull();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
