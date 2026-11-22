import { t } from "@lingui/core/macro";
import type { ApiClient } from "@schellingboard/api-client";
import type { Locale } from "@schellingboard/domain/locales";
import { useMemo } from "react";

import { settingsCalls } from "../commands/settings";
import { useLocale, useStoredLocale } from "../i18n";
import { languageName, LOCALES } from "../i18n/locales";
import { useOptionalViewer } from "./viewer";

/** The footer's language switch; a signed-in guest's choice is saved to their account too. */
export function LanguageSelect({
  api,
  locales = LOCALES,
}: {
  api: ApiClient;
  locales?: readonly string[];
}) {
  const { setStored } = useStoredLocale();
  const active = useLocale();
  const signedIn = !!useOptionalViewer()?.guestId;
  const calls = useMemo(() => settingsCalls(api), [api]);
  if (locales.length < 2) return null;

  const choose = (locale: string) => {
    setStored(locale);
    if (signedIn)
      void calls
        .saveLocale({ locale: locale as Locale }, crypto.randomUUID())
        .catch(() => {});
  };
  return (
    <select
      aria-label={t`Language`}
      value={active}
      onChange={(e) => choose(e.target.value)}
      className="w-fit rounded-md border border-line bg-surface-raised py-1 pl-2 pr-6 text-xs leading-4 text-fg-muted"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {languageName(locale)}
        </option>
      ))}
    </select>
  );
}
