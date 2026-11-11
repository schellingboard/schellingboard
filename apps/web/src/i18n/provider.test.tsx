import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Settings } from "luxon";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "./index";
import { useFormatLocale } from "./format-locale";

function Probe() {
  return <p>formats as {useFormatLocale()}</p>;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  Settings.defaultLocale = undefined as never;
});

describe("the format locale", { tags: ["022-US1"] }, () => {
  it("takes the browser's region and gives it to dates", () => {
    vi.stubGlobal("navigator", { languages: ["en-GB"] });
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    );

    expect(screen.getByText("formats as en-GB")).toBeTruthy();
    expect(Settings.defaultLocale).toBe("en-GB");
  });

  it("borrows the region of a browser in another language", () => {
    vi.stubGlobal("navigator", { languages: ["de-DE"] });
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    );

    expect(screen.getByText("formats as en-DE")).toBeTruthy();
  });
});

describe("the pseudo-locale", { tags: ["022-US1"] }, () => {
  it("can be chosen in development", async () => {
    localStorage.setItem("sb-pseudo", "1");
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    );

    await waitFor(() =>
      expect(document.documentElement.lang).toBe("pseudo-LOCALE")
    );
  });
});
