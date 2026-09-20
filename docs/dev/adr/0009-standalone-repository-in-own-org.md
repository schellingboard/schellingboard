# ADR 0009: Move to a standalone repo in new schellingboard GitHub org

- **Status:** Accepted
- **Date:** 2026-09-19

## Context

The repository was `LWCW-Europe/schellingboard`, a fork of
`rachelweinberg12/scheduling-app`. That cost us in two ways:

- **Org name.** "LWCW-Europe" means little outside the rationality scene and made
  SchellingBoard look like software for one event rather than any conference.
- **Fork status.** Commits to a fork don't count on contributors' GitHub profiles,
  so our ~20 contributors got no visible credit. Forks are hidden from search by
  default, and "forked from…" makes the project look like a side copy. Upstream
  is less active and behind on features and bug fixes e.g. 3★ against 17★.

## Decision

Move to `schellingboard/schellingboard`, a standalone repository in a new
organization. The name was free and matches our Docker Hub repository.

GitHub can't detach a fork and keep its history, so the old repository is
archived as `schellingboard/schellingboard-legacy` and the new one starts fresh
from the code and tags. To keep `#123` references in commits and the changelog
working, every issue and PR number was reproduced in the new repository. Issues
were transferred with their discussion, and anything else became a closed stub
linking to the original. The website repository and DNS moved with it.

We did it early, because stars and history only grow.

## Consequences

- Stars (17), PR review discussions and forks are lost. The legacy README asks
  people to re-star and fork the new repository.
- Contributors point their remote at the new repository. Open PRs had to be
  reopened there.
- Links to `LWCW-Europe/schellingboard` in the docs, website and code were
  updated. Old issue URLs redirect.
