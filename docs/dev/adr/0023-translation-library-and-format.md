# ADR 0023: Lingui, ICU messages and `.po` catalogs

- **Status:** Accepted
- **Date:** 2026-11-13

## Context

The app is written in English only, yet events are run in other languages (issue #1328). Emails and
notifications are written by the server, everything else by the web app, so both need one set of
translations. The web app also works offline, so a language must not need the network once loaded.

## Decision

1. **[Lingui](https://lingui.dev) is the library**, for the web app and, through its core and a
   build-time macro transform, for the server.
2. **Messages are ICU MessageFormat.** Plurals, selects and number formatting follow the language's
   own rules, so no code branches on `n === 1`.
3. **Source strings are the ids.** Authors write English in the code and never invent keys. A reword
   creates a new message; translators see it as new.
4. **Catalogs are `.po` files**, `apps/web/locales/<locale>/messages.po`, committed. Translators can
   use any PO editor; a review reads as a diff. `en` is bundled with the app; other locales are lazy
   chunks.
5. **Lazy locale chunks are cached by the service worker** like any asset the page loads. They stay
   until the build changes, so a language the attendee used keeps working offline.

## Consequences

- Extraction runs in `make precommit` (`make i18n-check`); a stale or incomplete catalog fails it.
- The server reads the same `.po` files, copied into the Docker image, and compiles them at runtime.
- Rewording an English message costs a translation, so wording changes are deliberate.
- The conventions for writing messages are in [i18n.md](../i18n.md).
