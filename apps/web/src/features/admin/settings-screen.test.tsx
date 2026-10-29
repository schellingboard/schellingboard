import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminSettingsCalls } from "../../commands/admin-settings";
import { fakeApi, problem, type FakeCall } from "../../commands/fake-api";
import type { AdminSettings } from "../../queries/admin-settings";
import { NoticeProvider } from "../../ui/notices";
import { SettingsScreen } from "./settings-screen";

afterEach(cleanup);

const settings: AdminSettings = {
  title: "Con",
  description: "About",
  mapImageUrl: "",
};

const setup = (
  current: AdminSettings = settings,
  handler: (call: FakeCall) => Response = () =>
    Response.json({ ...current, title: "Saved" })
) => {
  const { api, calls } = fakeApi(handler);
  const onSaved = vi.fn();
  render(
    <NoticeProvider>
      <SettingsScreen
        status="ready"
        settings={current}
        calls={adminSettingsCalls(api)}
        onSaved={onSaved}
      />
    </NoticeProvider>
  );
  return { calls, onSaved };
};

describe("the admin settings screen", { tags: ["015-US5"] }, () => {
  it("saves the title and description", async () => {
    const { calls, onSaved } = setup();

    const title = screen.getByLabelText(/^Title/);
    await userEvent.clear(title);
    await userEvent.type(title, "New name");
    await userEvent.click(
      screen.getByRole("button", { name: "Save settings" })
    );

    expect(await screen.findByText("Settings saved.")).toBeTruthy();
    expect(onSaved).toHaveBeenCalled();
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/settings",
      body: { title: "New name", description: "About" },
    });
  });

  it("uploads a map", async () => {
    const { calls } = setup();

    await userEvent.upload(
      screen.getByLabelText("Map"),
      new File(["x"], "map.png", { type: "image/png" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save settings" })
    );

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({
      image: { file: "map.png", type: "image/png" },
    });
  });

  it("does not send a map that is too big", async () => {
    const { calls } = setup();

    await userEvent.upload(
      screen.getByLabelText("Map"),
      new File([new Uint8Array(6 * 1024 * 1024)], "map.png", {
        type: "image/png",
      })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save settings" })
    );

    expect(await screen.findByText(/Map exceeds/)).toBeTruthy();
    expect(calls).toHaveLength(0);
  });

  it("removes the current map", async () => {
    const { calls } = setup({ ...settings, mapImageUrl: "/media/map.png" });

    expect(screen.getByRole("img", { name: "Current map" })).toBeTruthy();
    await userEvent.click(screen.getByLabelText("Remove current map"));
    expect(screen.getByLabelText("Map").hasAttribute("disabled")).toBe(true);
    await userEvent.click(
      screen.getByRole("button", { name: "Save settings" })
    );

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({ removeMap: "true" });
    expect(calls[0].body).not.toHaveProperty("image");
  });

  it("shows why a map was refused", async () => {
    setup(settings, () =>
      Response.json(
        {
          type: "about:blank",
          title: "t",
          status: 422,
          code: "settings.mapInvalid",
          detail: "Map must be a JPEG, PNG or WebP image",
        },
        {
          status: 422,
          headers: { "content-type": "application/problem+json" },
        }
      )
    );

    await userEvent.upload(
      screen.getByLabelText("Map"),
      new File(["x"], "map.gif", { type: "image/gif" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save settings" })
    );

    expect(
      (await screen.findAllByText(/Map must be a JPEG/)).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Settings saved.")).toBeNull();
  });

  it("says when the settings could not load", () => {
    const { api } = fakeApi(() => problem(500, "x"));
    render(
      <SettingsScreen
        status="error"
        settings={settings}
        calls={adminSettingsCalls(api)}
        onSaved={vi.fn()}
      />
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Could not load the settings"
    );
  });
});
