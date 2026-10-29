import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FakeCall } from "../commands/fake-api";
import { hardNavigate } from "./hard-navigate";
import { open, running } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

const answers = (call: FakeCall): Response | undefined => {
  if (call.method === "POST" && call.path === "/api/v1/sessions")
    return Response.json(running.sessions[0], { status: 201 });
  if (call.path.startsWith("/api/v1/host-clashes"))
    return Response.json({ clashes: [] });
  return undefined;
};

describe("the session form pages", { tags: ["008-US1"] }, () => {
  it("adds a session in the slot named in the address, then shows the schedule", async () => {
    const { calls, router } = await open({
      path: "/conf/add-session?day=2026-06-15&time=10%3A00&location=Room",
      handler: answers,
    });

    await userEvent.type(
      await screen.findByLabelText(/Session title/),
      "Kubernetes"
    );
    await userEvent.click(screen.getByRole("button", { name: /Submit/ }));

    await waitFor(() => expect(router.history.location.pathname).toBe("/conf"));
    expect(
      calls.some((c) => c.method === "POST" && c.path === "/api/v1/sessions")
    ).toBe(true);
  });

  it(
    "edits the session named in the address",
    { tags: ["008-US2"] },
    async () => {
      await open({
        path: "/conf/edit-session?sessionID=s",
        handler: answers,
        snapshot: {
          ...running,
          me: { ...running.me!, guestId: "host" },
        },
      });

      expect(
        (await screen.findByLabelText<HTMLInputElement>(/Session title/)).value
      ).toBe("Talk");
    }
  );

  it("is reached from a free slot's link without leaving the app", async () => {
    const { router } = await open({ path: "/conf", handler: answers });

    await userEvent.click(
      (await screen.findAllByRole("link", { name: "Add session" }))[0]
    );

    expect(await screen.findByLabelText(/Session title/)).toBeTruthy();
    expect(router.history.location.pathname).toBe("/conf/add-session");
    expect(hardNavigate).not.toHaveBeenCalled();
  });
});
