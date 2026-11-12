import { useRef } from "react";
import type { Locale } from "@schellingboard/domain/locales";
import type { SettingsCalls } from "../../commands/settings";
import { useFormMutation } from "../../commands/use-form-mutation";
import { useStoredLocale } from "../../i18n";
import { LOCALES } from "../../i18n/locales";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

const languageName = (locale: string) =>
  new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale;

/** Which language the signed-in guest reads the app in, or the browser's. */
export function LanguageSetting({
  calls,
  locales = LOCALES,
}: {
  calls: Pick<SettingsCalls, "saveLocale">;
  locales?: readonly string[];
}) {
  const { stored, setStored } = useStoredLocale();
  const wanted = useRef<Locale | null>(null);
  const mutation = useFormMutation({
    call: (key) => calls.saveLocale({ locale: wanted.current }, key),
  });
  const error = mutation.error;
  const choose = async (value: string) => {
    wanted.current = (value || null) as Locale | null;
    const result = await mutation.submit();
    if (result?.ok) setStored(wanted.current);
  };
  return (
    <section aria-labelledby="language-heading" className="flex flex-col gap-2">
      <h2 id="language-heading" className="text-lg font-semibold">
        <Trans>Language</Trans>
      </h2>
      <select
        aria-label={t`Language`}
        value={stored ?? ""}
        disabled={mutation.pending}
        onChange={(e) => void choose(e.target.value)}
        className="w-fit rounded-md border border-line bg-surface-raised py-1 pl-2 pr-7 text-base text-fg sm:text-sm"
      >
        <option value="">{t`Automatic (follow my browser)`}</option>
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageName(locale)}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          <Trans>Error: {error}</Trans>
        </p>
      )}
    </section>
  );
}
