# Progress

## Decisions

- Session branch: `claude/spa-schedule`. No pushes (the user's rule).
- ADR 0015 accepted on 2026-10-08.

## Step 1: baseline (2026-10-08)

- `make test-e2e`: 207 passed, 1 flaky (`profile-comments.spec.ts:95`, the known
  load-only flake; passes on retry and alone). The run exits red only because
  `failOnFlakyTests` is on locally.
- `make test-e2e-docker`: 208 passed.
- No failure comes from the last run's commits; no fix step needed.

## Step 2 (2026-10-08)

- A 2 s grace (`RECONNECT_GRACE_MS`) after any drop keeps the state `live`; the
  store cannot tell a planned stream end from a failure, so the grace covers both.
  The feed sends `retry: 1000` with its first message so browsers reconnect inside
  the grace (an integration test ties the two).
- No CHANGELOG entry: the sync indicator is itself unreleased (#1111's entry).

## Step 3a (2026-10-08)

- `acting-guest` reads the auth credentials through a new `pageReads()` query.
  The dependency-cruiser rule now covers `utils/`; the helpers still to convert
  (3b, 3c) sit on its allow-list until then.

## Step 3b (2026-10-08)

- The meeting helpers and `guest-clashes` take their repositories from the caller;
  the meetings module's page reads (`pageReads().meetingViews` and the like) bind
  them for `app/`. Their integration tests call those. Server modules keep passing their own repos.

## Questions

## Next step

3c.
