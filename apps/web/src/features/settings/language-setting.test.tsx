import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi, problem } from "../../commands/fake-api";
import { settingsCalls } from "../../commands/settings";
import { I18nProvider, useStoredLocale } from "../../i18n";
import { NoticeProvider } from "../../ui/notices";
import { LanguageSetting } from "./language-setting";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function show(handler: Parameters<typeof fakeApi>[0]) {
  const fake = fakeApi(handler);
  function Stored() {
    return <p>stored {useStoredLocale().stored ?? "none"}</p>;
  }
  render(
    <NoticeProvider>
      <I18nProvider>
        <LanguageSetting
          calls={settingsCalls(fake.api)}
          locales={["en", "de-DE"]}
        />
        <Stored />
      </I18nProvider>
    </NoticeProvider>
  );
  return fake;
}

describe("the language setting", { tags: ["022-US1"] }, () => {
  it("saves the chosen language and applies it", async () => {
    const { calls } = show(() => new Response(null, { status: 204 }));

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Language" }),
      "de-DE"
    );

    await waitFor(() => expect(screen.getByText("stored de-DE")).toBeTruthy());
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/locale",
      body: { locale: "de-DE" },
    });
  });

  it("goes back to the browser's language on Automatic", async () => {
    localStorage.setItem("sb-locale", "de-DE");
    const { calls } = show(() => new Response(null, { status: 204 }));

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Language" }),
      "Automatic (follow my browser)"
    );

    await waitFor(() => expect(screen.getByText("stored none")).toBeTruthy());
    expect(calls[0].body).toEqual({ locale: null });
  });

  it("keeps the language and says so when saving fails", async () => {
    show(() => problem(500, "server.error"));

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Language" }),
      "de-DE"
    );

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("stored none")).toBeTruthy();
  });
});
