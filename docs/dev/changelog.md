# Changelog and release notes

## The changelog

Update
[`CHANGELOG.md`](https://github.com/schellingboard/schellingboard/blob/main/CHANGELOG.md)
under `[Unreleased]` alongside any user-facing change.

**Audience**: event organizers, not developers. Plain language, no jargon
(framework names, file/function names, library versions) — describe what changed
for them, not how it was implemented.

**Sections** (Keep a Changelog order; use only what applies):

- `Added` — new features
- `Changed` — changes to existing behavior
- `Deprecated` — features being phased out
- `Removed` — removed features
- `Fixed` — bug fixes
- `Security` — vulnerability fixes
- `Internal` — dev-only changes (tooling, tests, refactors, CI) with no visible effect on organizers

**Conventions**:

- One bullet per change, at most two lines: `- **Bold lead phrase** (#123): what changed, and — where it isn't obvious — what was wrong before`
- Reference the GitHub issue when one exists, taken from the commit's `fixes #123` / `issue #123` footer (not the PR number in a squashed subject)
- Several commits delivering one feature get one bullet between them
- Order bullets within a section roughly by importance
- Breaking changes: `> **Breaking change**: ...` blockquote at the top of the release
- Leave out rationale, implementation, edge cases and how a bug was found — those belong in the commit message, an ADR or these developer docs
- `Internal` is not a second commit history: only internal changes that are particularly valuable, disruptive or a highlight, around three per release, one line each

The full rules, with the hard limits and worked examples, are in
[`AGENTS.md § Changelog`](https://github.com/schellingboard/schellingboard/blob/main/AGENTS.md#changelog).

## In-app release notes

The app carries a much shorter version of the changelog:
[`app/release-notes.ts`](https://github.com/schellingboard/schellingboard/blob/main/app/release-notes.ts),
shown when the footer's version is clicked. It holds **3–5 highlights** of the
coming release — inline markdown, taking the same **bold** lead phrase as the
changelog bullets.

Add yours to the first entry — the undated `"Unreleased"` one — as the change
lands, and replace a weaker highlight rather than adding a sixth. Finalizing the
release gives that entry its version and date, after checking its highlights
against the changelog — see [Releasing a new version](releasing.md).
