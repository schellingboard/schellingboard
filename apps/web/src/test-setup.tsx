import { i18n } from "@lingui/core";
import { useContext } from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Macros compile to their source text, so no catalog is needed.
i18n.loadAndActivate({ locale: "en", messages: {} });

// Most tests render without a provider; <Trans> only gets one when none is above it.
vi.mock("@lingui/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lingui/react")>();
  return {
    ...actual,
    Trans: (props: Parameters<typeof actual.Trans>[0]) =>
      useContext(actual.LinguiContext) ? (
        <actual.Trans {...props} />
      ) : (
        <actual.I18nProvider i18n={i18n}>
          <actual.Trans {...props} />
        </actual.I18nProvider>
      ),
  };
});

afterEach(cleanup);
