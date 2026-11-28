import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeApi } from "../commands/fake-api";
import { NoticeProvider } from "../ui/notices";
import { NameConfirmDialog } from "./name-confirm-dialog";

afterEach(cleanup);

const setup = (names: string[] = []) => {
  const { api, calls } = fakeApi(() => Response.json({ id: "g1" }));
  const onConfirmed = vi.fn();
  render(
    <NoticeProvider>
      <NameConfirmDialog
        api={api}
        names={names}
        initial="ada"
        onConfirmed={onConfirmed}
      />
    </NoticeProvider>
  );
  return { calls, onConfirmed };
};

describe("the name dialog", { tags: ["025-US2"] }, () => {
  it("shows the given name with only a Save button, and cannot be dismissed", async () => {
    setup();

    expect(screen.getByRole("dialog", { name: "Your name" })).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: /Name/ }).value
    ).toBe("ada");
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByTestId("dialog-backdrop"));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("saves the name that is shown", async () => {
    const { calls, onConfirmed } = setup();

    await userEvent.clear(screen.getByRole("textbox", { name: /Name/ }));
    await userEvent.type(
      screen.getByRole("textbox", { name: /Name/ }),
      "Ada Lovelace"
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onConfirmed).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/me/name",
      body: { name: "Ada Lovelace" },
    });
  });

  it("warns when another person has the same name", async () => {
    setup(["Ada Lovelace"]);

    await userEvent.clear(screen.getByRole("textbox", { name: /Name/ }));
    await userEvent.type(
      screen.getByRole("textbox", { name: /Name/ }),
      "ada lovelace"
    );

    expect(screen.getByRole("status").textContent).toContain("already called");
  });
});
