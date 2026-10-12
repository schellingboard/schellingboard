import { useState } from "react";
import {
  releaseNotes,
  SHOWN_RELEASES,
} from "@schellingboard/domain/release-notes";
import { Dialog } from "../ui/dialog";
import { InlineMarkdown } from "../ui/inline-markdown";
import { ThemeSelect } from "./theme";

const CHANGELOG_URL =
  "https://github.com/schellingboard/schellingboard/blob/main/CHANGELOG.md";

// The calendar date the release carries in CHANGELOG.md, whatever the reader's zone.
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const link = "text-link hover:underline";

export function Footer({ version }: { version: string | undefined }) {
  const [open, setOpen] = useState(false);
  const shown = version ?? "unknown";

  return (
    <footer className="mt-auto border-t border-line-subtle bg-surface-sunken py-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 text-xs text-fg-subtle md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="md:justify-self-start">
          <button
            type="button"
            title="What's new"
            aria-label={`Version ${shown} — what's new`}
            onClick={() => setOpen(true)}
            className={`flex gap-1 rounded-sm ${link} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent`}
          >
            <span className="hidden sm:block">Version: </span>
            {shown}
          </button>
        </div>
        <ThemeSelect />
        <div className="flex flex-wrap items-center justify-end gap-1 md:justify-self-end">
          <span className="hidden sm:block">Powered by</span>
          <a
            href="https://schellingboard.org"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            SchellingBoard
          </a>
          <span>·</span>
          <a
            href="https://docs.schellingboard.org"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Help
          </a>
          <span>·</span>
          <a
            href="https://github.com/schellingboard/schellingboard/issues"
            className={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Report a Bug
          </a>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="What's new"
        wide
      >
        <p className="text-sm text-fg-subtle">This site is running {shown}.</p>
        <div className="mt-4 space-y-4">
          {releaseNotes.slice(0, SHOWN_RELEASES).map((release) => (
            <section key={release.version}>
              <h3 className="border-b border-line-subtle pb-1 text-base font-bold text-fg">
                {release.date
                  ? `${release.version} — ${formatDate(release.date)}`
                  : release.version}
              </h3>
              {!release.date && (
                <p className="mt-1 text-xs text-fg-subtle">
                  In this build, but not in a released version yet.
                </p>
              )}
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-fg">
                {release.highlights.map((highlight) => (
                  <li key={highlight}>
                    <InlineMarkdown>{highlight}</InlineMarkdown>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <a
          href={CHANGELOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-block text-sm ${link}`}
        >
          Full changelog on GitHub
        </a>
      </Dialog>
    </footer>
  );
}
