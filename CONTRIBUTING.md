# Contributing

SchellingBoard is a self-hosted scheduling app for participant-driven events:
attendees propose sessions, vote on them, and the accepted ones are scheduled
onto a grid of rooms and time slots. It is Next.js, TypeScript and SQLite, run
with Bun.

**The developer documentation is at
[developers.schellingboard.org](https://developers.schellingboard.org)** — how
to set up and run the project, the testing and coding guidelines, the
architecture decision records, and the release process. It is built from
[`docs/dev/`](docs/dev/README.md) on every push to `main`, so it always matches
the default branch; on a release branch, read that branch's `docs/dev/`.

To get going:

```bash
make install       # Install dependencies
make dev           # Start the dev server on http://localhost:3000
make precommit     # Format, lint, type check, run all tests — before every commit
```

Full setup, including the optional `.env.dev.local` and seeding a database, is
in [Getting started](https://developers.schellingboard.org/getting-started/).

Two things worth knowing before you open a pull request:

- Conventional commit subjects (`feat:`, `fix:`, `docs:`, …), ≤ 72 chars, with
  a `fixes #123` or `issue #123` footer when there is an issue.
- Self-review is mandatory: read your own diff before submitting. This matters
  most when using AI agents, which produce plausible-looking but incorrect code.
  Draft PRs are fine for sharing work in progress without that expectation.

User-facing changes need a `CHANGELOG.md` bullet under `[Unreleased]`, written
for event organizers rather than developers — see
[Changelog](https://developers.schellingboard.org/changelog/).
