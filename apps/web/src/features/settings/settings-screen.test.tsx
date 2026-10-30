import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi } from "../../commands/fake-api";
import { meetingAvailabilityCalls } from "../../commands/meeting-availability";
import { settingsCalls } from "../../commands/settings";
import { NoticeProvider } from "../../ui/notices";
import type { SettingsState } from "../../queries/settings";
import { SettingsScreen } from "./settings-screen";

afterEach(cleanup);

const emailSettings = {
  rsvpChange: true,
  hostChange: true,
  cohostAdd: true,
  proposalJoin: true,
  proposalComment: true,
  sessionComment: true,
  profileComment: true,
  commentThread: false,
  meetingRequest: true,
  meetingResponse: true,
  sessionHeadsUp: true,
  attendeeCountReminder: true,
};

const form = (eventId: string, eventName: string) => ({
  eventId,
  eventName,
  timezone: "UTC",
  days: [],
  declared: [],
});

function show(state: SettingsState) {
  const { api } = fakeApi(() => new Response(null, { status: 204 }));
  render(
    <NoticeProvider>
      <SettingsScreen
        state={state}
        calls={settingsCalls(api)}
        availability={meetingAvailabilityCalls(api)}
        links={{
          profile: "/guests/edit",
          security: "/account-security",
        }}
      />
    </NoticeProvider>
  );
}

const readyWith = (forms: ReturnType<typeof form>[]): SettingsState => ({
  status: "ready",
  emailSettings,
  forms,
  publicKey: "AQAB",
});

describe("the settings page", { tags: ["013-US5"] }, () => {
  it("has the email settings, this device, one panel per event and the theme", () => {
    show(readyWith([form("e1", "Autumn Camp"), form("e2", "Spring Camp")]));

    expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "public profile" }).getAttribute("href")
    ).toBe("/guests/edit");
    expect(screen.getByText(/Email me when/)).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Notifications on this device" })
    ).toBeTruthy();
    expect(screen.getByText("Autumn Camp")).toBeTruthy();
    expect(screen.getByText("Spring Camp")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Colour theme" })).toBeTruthy();
  });

  it("links to the account security page", () => {
    show(readyWith([]));

    expect(
      screen
        .getByRole("link", { name: "Account security" })
        .getAttribute("href")
    ).toBe("/account-security");
  });

  it("says when no event offers 1-on-1s", () => {
    show(readyWith([]));

    expect(screen.getByText(/None of your events offers 1-on-1s/)).toBeTruthy();
  });

  it("shows no settings while loading or when they could not be loaded", () => {
    show({ status: "loading" });
    expect(screen.queryByRole("heading", { name: "Settings" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Loading…");
    cleanup();

    show({ status: "error", code: "http.500" });
    expect(screen.getByRole("alert").textContent).toMatch(/Could not load/);
    expect(screen.getByRole("group", { name: "Colour theme" })).toBeTruthy();
  });
});
