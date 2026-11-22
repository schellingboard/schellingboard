import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { fakeApi } from "../commands/fake-api";
import { I18nProvider, useStoredLocale } from "../i18n";
import { LanguageSelect } from "./language-select";
import { ViewerContext } from "./viewer";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function Stored() {
  return <p>stored {useStoredLocale().stored ?? "none"}</p>;
}

const viewer = (guestId: string | null) => ({
  guestId,
  choose: () => Promise.resolve({ ok: true as const }),
  signOut: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
});

function show(guestId: string | null, withViewer = true) {
  const fake = fakeApi(() => new Response(null, { status: 204 }));
  const select = <LanguageSelect api={fake.api} locales={["en", "fr"]} />;
  render(
    <I18nProvider>
      {!withViewer ? (
        select
      ) : (
        <ViewerContext.Provider value={viewer(guestId)}>
          {select}
        </ViewerContext.Provider>
      )}
      <Stored />
    </I18nProvider>
  );
  return fake;
}

describe("the footer language switch", { tags: ["022-US1"] }, () => {
  it("shows the language in use without storing it as a choice", () => {
    show(null);

    expect(
      screen.getByRole<HTMLSelectElement>("combobox", { name: "Language" })
        .value
    ).toBe("en");
    expect(screen.getByText("stored none")).toBeTruthy();
  });

  it("applies a chosen language and saves it for a signed-in guest", async () => {
    const { calls } = show("g1");

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Language" }),
      "fr"
    );

    await waitFor(() => expect(screen.getByText("stored fr")).toBeTruthy());
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/locale",
      body: { locale: "fr" },
    });
  });

  it("only applies it on this device when nobody is signed in", async () => {
    const { calls } = show(null, false);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Language" }),
      "fr"
    );

    await waitFor(() => expect(screen.getByText("stored fr")).toBeTruthy());
    expect(calls).toHaveLength(0);
  });
});
