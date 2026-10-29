// @module-tag 009-US1
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NoticeProvider, useNotify, type Notice } from "./notices";

function Raiser({
  notice,
  vanishes = false,
}: {
  notice: Notice;
  vanishes?: boolean;
}) {
  const notify = useNotify();
  const [shown, setShown] = useState(true);
  return shown ? (
    <button
      onClick={() => {
        notify(notice);
        if (vanishes) setShown(false);
      }}
    >
      Go
    </button>
  ) : null;
}

const go = () => userEvent.click(screen.getByRole("button", { name: "Go" }));

describe("notices", () => {
  it("announces a failure as an alert that outlives the control that raised it", async () => {
    render(
      <NoticeProvider>
        <Raiser
          vanishes
          notice={{ tone: "failure", message: "Could not save" }}
        />
      </NoticeProvider>
    );

    await go();

    expect(screen.queryByRole("button", { name: "Go" })).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("Could not save");
  });

  it("shows a failure that arrives after the control is gone", async () => {
    function Late() {
      const notify = useNotify();
      const [shown, setShown] = useState(true);
      return shown ? (
        <button
          onClick={() => {
            setShown(false);
            void Promise.resolve().then(() =>
              notify({ tone: "failure", message: "Late failure" })
            );
          }}
        >
          Go
        </button>
      ) : null;
    }
    render(
      <NoticeProvider>
        <Late />
      </NoticeProvider>
    );

    await go();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Late failure"
    );
  });

  it("announces a confirmation as a status", async () => {
    render(
      <NoticeProvider>
        <Raiser notice={{ tone: "info", message: "Saved" }} />
      </NoticeProvider>
    );

    await go();

    expect(screen.getByRole("status").textContent).toContain("Saved");
  });

  it("clears a notice by itself when it asks to", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(
        <NoticeProvider>
          <Raiser
            notice={{ tone: "info", message: "Saved", autoDismissMs: 5000 }}
          />
        </NoticeProvider>
      );

      await go();
      expect(screen.getByRole("status")).toBeTruthy();
      await act(() => vi.advanceTimersByTimeAsync(5000));

      expect(screen.queryByRole("status")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("runs an action and closes the notice, or just dismisses it", async () => {
    const run = vi.fn();
    render(
      <NoticeProvider>
        <Raiser
          notice={{
            tone: "failure",
            message: "Might not be saved",
            action: { label: "Try again", run },
          }}
        />
      </NoticeProvider>
    );

    await go();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(run).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).toBeNull();

    await go();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does nothing outside a provider", async () => {
    render(<Raiser notice={{ tone: "failure", message: "x" }} />);
    await go();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
