import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeApi, problem, type FakeCall } from "../commands/fake-api";
import { AdminFrame, useReloadAdminGate } from "./admin-frame";

const hardNavigate = vi.hoisted(() => vi.fn());
vi.mock("./hard-navigate", () => ({ hardNavigate, hardReload: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  hardNavigate.mockClear();
});

const answer = (settings: Response) => (call: FakeCall) => {
  if (call.path === "/api/v1/admin/settings") return settings;
  if (call.path === "/api/v1/health")
    return Response.json({
      status: "ok",
      version: "4.1.0",
      buildId: "b",
      devTools: false,
    });
  return problem(404, "not.found");
};

const open = (
  settings: Response = Response.json({
    title: "Con",
    description: "",
    mapImageUrl: "",
  }),
  currentPath = "/admin/events/conf"
) => {
  const { api, calls } = fakeApi(answer(settings));
  render(
    <AdminFrame api={api} currentPath={currentPath} search="?q=x">
      <h1>Events</h1>
    </AdminFrame>
  );
  return calls;
};

describe("the admin frame", { tags: ["015-US1"] }, () => {
  it("shows the site title, the admin nav and the page once the gate is open", async () => {
    open();

    expect(await screen.findByRole("heading", { name: "Events" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Con Admin" }).getAttribute("href")
    ).toBe("/admin");
    const nav = screen.getByRole("navigation", { name: "Admin" });
    const links = Array.from(nav.querySelectorAll("a"));
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Events", "/admin/events"],
      ["Users", "/admin/users"],
      ["Locations", "/admin/locations"],
      ["Settings", "/admin/settings"],
    ]);
    expect(
      links
        .filter((a) => a.hasAttribute("aria-current"))
        .map((a) => a.textContent)
    ).toEqual(["Events"]);
  });

  it.each([401, 403])(
    "sends the browser to the admin login, back to this page after, on %i",
    async (status) => {
      open(problem(status, "admin.required"));

      await waitFor(() =>
        expect(hardNavigate).toHaveBeenCalledWith(
          "/legacy/admin/login?redirect=%2Fadmin%2Fevents%2Fconf%3Fq%3Dx"
        )
      );
      expect(screen.queryByRole("heading", { name: "Events" })).toBeNull();
    }
  );

  it("shows the new site title when a page asks the gate to reload", async () => {
    const user = userEvent.setup();
    let title = "Con";
    const { api } = fakeApi((call) =>
      call.path === "/api/v1/admin/settings"
        ? Response.json({ title, description: "", mapImageUrl: "" })
        : problem(404, "not.found")
    );
    function Rename() {
      const reload = useReloadAdminGate();
      return (
        <button
          type="button"
          onClick={() => {
            title = "Renamed";
            reload();
          }}
        >
          Rename
        </button>
      );
    }
    render(
      <AdminFrame api={api} currentPath="/admin/settings" search="">
        <Rename />
      </AdminFrame>
    );

    await user.click(await screen.findByRole("button", { name: "Rename" }));

    expect(
      await screen.findByRole("link", { name: "Renamed Admin" })
    ).toBeTruthy();
  });

  it("says so, and does not redirect, when the gate cannot be read", async () => {
    open(problem(500, "internal"));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "internal"
    );
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it("logs out and lands on the admin login", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204 }))
    );
    vi.stubGlobal("fetch", fetchMock);
    open();

    await user.click(
      await screen.findByRole("button", { name: "Admin logout" })
    );

    await waitFor(() =>
      expect(hardNavigate).toHaveBeenCalledWith("/legacy/admin/login")
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/logout", {
      method: "POST",
    });
  });

  it.each([401, 403])(
    "counts a logout answered %i as done: the admin was already signed out",
    async (status) => {
      const user = userEvent.setup();
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(new Response(null, { status })))
      );
      open();

      await user.click(
        await screen.findByRole("button", { name: "Admin logout" })
      );

      await waitFor(() =>
        expect(hardNavigate).toHaveBeenCalledWith("/legacy/admin/login")
      );
    }
  );

  it("opens the nav behind a menu button on narrow screens", async () => {
    const user = userEvent.setup();
    open();

    await user.click(
      await screen.findByRole("button", { name: "Open admin menu" })
    );

    expect(screen.getAllByRole("navigation", { name: "Admin" })).toHaveLength(
      2
    );
    expect(
      screen.getByRole("button", { name: "Close admin menu" })
    ).toBeTruthy();
  });
});
