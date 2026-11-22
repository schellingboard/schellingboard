import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ApiClient } from "@schellingboard/api-client";
import {
  releaseNotes,
  SHOWN_RELEASES,
  UPDATE_DOCS_URL,
} from "@schellingboard/domain/release-notes";
import { useState } from "react";

import { useFormatLocale } from "../i18n/format-locale";
import { Dialog } from "../ui/dialog";
import { InlineMarkdown } from "../ui/inline-markdown";
import { Tooltip } from "../ui/tooltip";
import { LanguageSelect } from "./language-select";
import { releaseHighlights } from "./release-highlights";
import { ThemeSelect } from "./theme";
import type { UpdateStatus } from "./updates";

const CHANGELOG_URL =
  "https://github.com/schellingboard/schellingboard/blob/main/CHANGELOG.md";

// The calendar date the release carries in CHANGELOG.md, whatever the reader's zone.
const formatDate = (date: string, locale: string) =>
  new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const BRAND = "SchellingBoard";
const link = "text-link hover:underline";

export function Footer({
  api,
  version,
  update,
  inline,
}: {
  api: ApiClient;
  version: string | undefined;
  /** Only the admin is told; everyone else gets null. */
  update?: UpdateStatus | null;
  /** A copy inside a screen's scroll content, for screens that hide the page's footer. */
  inline?: boolean;
}) {
  const locale = useFormatLocale();
  const [open, setOpen] = useState(false);
  const shown = version ?? t`unknown`;
  const behind = update?.updateAvailable ? update : null;
  const latest = behind?.latest;
  const latestVersion = latest?.version ?? "";
  const currentVersion = behind?.current.version ?? "";
  const latestDate = latest?.date ? formatDate(latest.date, locale) : null;
  const currentDate = behind?.current.date
    ? formatDate(behind.current.date, locale)
    : null;

  return (
    <footer
      data-site-footer={inline ? undefined : ""}
      className={`${inline ? "" : "mt-auto "}border-t border-line-subtle bg-surface-sunken py-2`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 text-xs text-fg-subtle md:grid md:grid-cols-[1fr_auto_1fr] ${inline ? "sticky left-0 max-w-[100dvw]" : ""}`}
      >
        <div className="md:justify-self-start">
          <Tooltip content={t`What's new`}>
            <button
              type="button"
              aria-label={
                behind
                  ? t`Version ${shown} — what's new, update available`
                  : t`Version ${shown} — what's new`
              }
              onClick={() => setOpen(true)}
              className={`flex gap-1 rounded-sm ${link} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent`}
            >
              <span className="hidden sm:block">{t`Version:`} </span>
              {shown}
              {behind && (
                <span
                  aria-hidden
                  className="mt-[3px] size-2 shrink-0 rounded-full bg-danger"
                />
              )}
            </button>
          </Tooltip>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <LanguageSelect api={api} />
          <ThemeSelect />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1 md:justify-self-end">
          <span className="hidden sm:block">{t`Powered by`}</span>
          <a
            href="https://schellingboard.org"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {BRAND}
          </a>
          <span>·</span>
          <a
            href="https://docs.schellingboard.org"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t`Help`}
          </a>
          <span>·</span>
          <a
            href="https://github.com/schellingboard/schellingboard/issues"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t`Report a Bug`}
          </a>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t`What's new`}
        wide
      >
        <p className="text-sm text-fg-subtle">
          <Trans>This site is running {shown}.</Trans>
        </p>
        {latest && behind && (
          <p className="mt-2 text-sm text-fg">
            {latestDate
              ? t`A newer release is out: ${latestVersion}, ${latestDate}.`
              : t`A newer release is out: ${latestVersion}.`}{" "}
            {currentDate
              ? t`This site runs ${currentVersion}, ${currentDate}.`
              : t`This site runs ${currentVersion}.`}{" "}
            <a
              href={UPDATE_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              {t`How to update`}
            </a>
          </p>
        )}
        <div className="mt-4 space-y-4">
          {releaseNotes.slice(0, SHOWN_RELEASES).map((release) => {
            const { version } = release;
            const releaseDate = release.date
              ? formatDate(release.date, locale)
              : "";
            return (
              <section key={release.version}>
                <h3 className="border-b border-line-subtle pb-1 text-base font-bold text-fg">
                  {release.date
                    ? t`${version} — ${releaseDate}`
                    : release.version}
                </h3>
                {!release.date && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    <Trans>
                      In this build, but not in a released version yet.
                    </Trans>
                  </p>
                )}
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-fg">
                  {(releaseHighlights[release.version] ?? []).map(
                    (highlight, index) => (
                      <li key={index}>
                        <InlineMarkdown>{i18n._(highlight)}</InlineMarkdown>
                      </li>
                    )
                  )}
                </ul>
              </section>
            );
          })}
        </div>
        <a
          href={CHANGELOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-block text-sm ${link}`}
        >
          {t`Full changelog on GitHub`}
        </a>
      </Dialog>
    </footer>
  );
}
