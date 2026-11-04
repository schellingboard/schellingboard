import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeApi } from "../commands/fake-api";
import { Shell } from "./shell";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

function show(devTools: boolean) {
  const { api } = fakeApi((call) =>
    call.path === "/api/v1/health"
      ? Response.json({
          status: "ok",
          version: "4.0.0",
          buildId: "b",
          devTools,
        })
      : Response.json({ guestId: "g1" })
  );
  render(
    <Shell
      api={api}
      events={[{ name: "Conf", href: "/legacy/conf" }]}
      guests={[{ id: "g1", name: "Ada", authProtected: false }]}
      currentPath="/legacy/conf"
      search="?dev=1"
      onClockChange={() => {}}
    >
      <p>the page</p>
    </Shell>
  );
}

describe("Shell", () => {
  it("frames the page with the nav, the viewer's name and the footer", async () => {
    show(false);

    expect(screen.getByText("the page")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Conf" })[0]).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: "Your name: Ada" })
    ).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: /Version 4.0.0/ })
    ).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Dev clock" })).toBeNull();
  });

  it("shows the dev clock when the server has dev tools on", async () => {
    show(true);
    expect(
      await screen.findByRole("region", { name: "Dev clock" })
    ).toBeTruthy();
  });

  it("keeps the page up when one screen crashes", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { api } = fakeApi(() => Response.json({ guestId: null }));
    function Bad(): never {
      throw new Error("boom");
    }
    render(
      <Shell
        api={api}
        events={[]}
        guests={[]}
        currentPath="/"
        search=""
        onClockChange={() => {}}
      >
        <Bad />
      </Shell>
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  describe("the site map", { tags: ["015-US5"] }, () => {
    const showWith = (mapImageUrl: string) => {
      const { api, calls } = fakeApi((call) =>
        call.path === "/api/v1/site"
          ? Response.json({ title: "T", description: "", mapImageUrl })
          : Response.json({ guestId: null })
      );
      render(
        <Shell
          api={api}
          events={[]}
          guests={[]}
          currentPath="/"
          search=""
          onClockChange={() => {}}
        >
          <p>the page</p>
        </Shell>
      );
      return calls;
    };

    it("opens the uploaded map from a nav button", async () => {
      showWith("/media/map.png");

      await userEvent.click(
        await screen.findByRole("button", { name: "Show map" })
      );

      expect(screen.getByRole("img", { name: "Map" }).getAttribute("src")).toBe(
        "/media/map.png"
      );
      await userEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.queryByRole("img", { name: "Map" })).toBeNull();
    });

    it("offers no map button when none is uploaded", async () => {
      const calls = showWith("");

      await waitFor(() =>
        expect(calls.some((c) => c.path === "/api/v1/site")).toBe(true)
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(screen.queryByRole("button", { name: "Show map" })).toBeNull();
    });
  });
});
