# Version control and pull requests

## Commits

- Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- Subject line ≤ 72 chars; explain WHY in the body if not obvious
- Before committing, run `make precommit`
- When working on a GitHub issue, add a footer: `issue #123` (partial work) or
  `fixes #123` (fully resolves it)

Either `jj` or `git` works; the repository is git-colocated. The `jj`-specific
gotchas an agent keeps hitting — bracketed route paths as path arguments,
non-interactive `squash` and `split` — are in
[`AGENTS.md`](https://github.com/schellingboard/schellingboard/blob/main/AGENTS.md).

Migration meta files conflict whenever two branches add a migration; see
[Database migrations](migrations.md#resolving-migration-conflicts) rather than
resolving them by hand.

## Pull requests

Self-review before submitting is mandatory — read your own diff, check for
obvious mistakes, and make sure the PR description is accurate. Do not offload
that work onto the reviewer. This is especially important when using AI agents,
which can produce plausible-looking but incorrect code. Draft PRs are fine for
sharing work-in-progress without that expectation.

## Issues

Issue Type and Priority are GitHub project fields that `gh issue create` cannot
set; [GitHub issues](github-issues.md) has the `gh api graphql` calls that can.
