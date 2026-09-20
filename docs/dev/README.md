# SchellingBoard developer documentation

SchellingBoard is a Next.js scheduling app for participant-driven events —
attendees propose sessions, vote on them, and the accepted ones are scheduled
onto a grid of rooms and time slots. It is self-hosted, backed by a single
SQLite file, and documented for its users at
[docs.schellingboard.org](https://docs.schellingboard.org).

This site is for people working _on_ it. It tracks `main`, so it describes the
code as it is now rather than the last release; a contributor on a release
branch reads that branch's `docs/dev/` in the repository.

## Start here

| Chapter                                   | For                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| [Getting started](getting-started.md)     | stack, prerequisites, setup, env vars, the dev commands                        |
| [Coding guidelines](coding-guidelines.md) | code style, when to write a comment, the colour tokens, the authorization rule |
| [Testing](testing.md)                     | test strategy, TDD workflow, running tests, the Docker tier                    |
| [Version control](version-control.md)     | commit conventions, pull requests, issues                                      |
| [Changelog](changelog.md)                 | what belongs in `CHANGELOG.md` and in the in-app release notes                 |

## Reference

| Chapter                                             | For                                                      |
| --------------------------------------------------- | -------------------------------------------------------- |
| [Architecture rules](architecture-rules.md)         | the conventions the build enforces, and how to add one   |
| [Database migrations](migrations.md)                | generating migrations, resolving drizzle conflicts       |
| [Running multiple instances](multiple-instances.md) | ports and env files when several clones share a machine  |
| [Documentation and the sites](documentation.md)     | how the three published sites are built                  |
| [Releasing a new version](releasing.md)             | tagging, the release checklist, publishing Docker images |
| [GitHub issues](github-issues.md)                   | setting Issue Type and Priority via `gh api graphql`     |

## Design

| Chapter                                                             | For                                                                      |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [ADRs](adr/README.md)                                               | why the significant decisions were made                                  |
| [Target architecture](target-architecture/README.md)                | the from-scratch design proposal: levels 0–3, decisions, C4 diagrams     |
| [Diagram explorer](https://developers.schellingboard.org/diagrams/) | the same C4 model, browsable — every view, with drill-down               |
| [Attendance model](attendance-model/README.md)                      | predicting how many people show up to a session, from its voting results |
| [Matrix chat feasibility](exploration/matrix-chat.md)               | exploratory notes on integrating a Matrix chat server — not yet decided  |

## Elsewhere

- [The repository](https://github.com/schellingboard/schellingboard) —
  [`CONTRIBUTING.md`](https://github.com/schellingboard/schellingboard/blob/main/CONTRIBUTING.md)
  points back here, and
  [`AGENTS.md`](https://github.com/schellingboard/schellingboard/blob/main/AGENTS.md)
  holds the instructions coding agents are given.
- [docs.schellingboard.org](https://docs.schellingboard.org) — the attendee,
  organizer and self-hosting documentation, published from release tags.
- [schellingboard.org](https://schellingboard.org) — the project's landing page.
