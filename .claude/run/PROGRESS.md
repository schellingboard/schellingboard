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

## Step 3c (2026-10-08)

- `dispatchDueReminders` takes its repositories; `dispatchReminders()` in
  `composition.ts` serves the dev action and tests, the job loop passes the
  container itself (it is allow-listed with the other job plumbing).
- Step 3 done: the rule covers `utils/` with only jobs, notifications and push allowed.

## Step 4a (2026-10-08)

- New change types `proposal.joined` and `comment.created` (all three subject
  kinds), audience `none`: logged for the reaction, projected to no one. The
  comment entry keeps only the comment's id, author and time, not its body. The
  reaction (renamed `changeNotifications`, stored name `session-notifications`
  kept so its cursor stays) handles them. Use cases no longer take
  `notifyProposalJoined` / `notifyCommented`.
- Co-hosts added belongs to the sessions family, so it moves to 4b.
- Tests that waited for `after()` tasks now call `runJobs()`.

## Step 4b (2026-10-08)

- New change type `session.cohostsAdded` (ids of the added hosts, audience `none`),
  recorded by the four paths that created or edited a session with new hosts.
  The seed path records none, so it stays silent as before. The existing reaction
  loads the session when it runs. `notifyCohostsAdded` is no longer a use-case
  dependency.

## Step 4c (2026-10-08)

- New change types `meeting.requested` and `meeting.answered` (meeting id, plus
  the outcome for the latter; audience `none`), recorded beside `meeting.changed`
  in the request, respond and cancel use cases. The existing reaction loads the
  meeting and notifies; a meeting that is gone is skipped. No use case takes a
  notify dependency any more, so step 4 is done and `composition.ts` has no `after()`.
- Tests that waited for the inline notice now call `runJobs()`.

## Step 5 (2026-10-08)

- `recordingSessionCascade` takes `{ tellAttendees }`; the day and location
  deletes set it, event and guest deletes do not. The flag rides on the
  `session.changed` / `session.deleted` payload next to `cascade`, and the
  reaction then notifies only the RSVPed guests (hosts get nothing, as settled).
  RSVP ids were already in the `session.deleted` payload. ADR 0014 open question 1
  marked answered.

## Step 6 (2026-10-08)

- `rsvpRefusal` in `packages/domain/src/rsvp-rule.ts` returns the reason code
  (guest not in event, not the scheduling phase, own session, full). The RSVP and
  withdraw use cases call it; the repository's atomic capacity insert stays as the
  guard against a race, mapping to the same `session.full`. The admin seeding path
  (no phase gate) does not use it.

## Step 7a (2026-10-08)

- `PUT /api/v1/me/identity` (choose) and `DELETE` (sign out) return `{ guestId }`
  and set the `guest` cookie. The use case returns an `Identity` and the adapters
  (route, `selectUserAction`) build the cookie. Protected names answer
  `403 guest.protected`; logging in stays on the legacy flow. The guest cookie
  builders moved to `utils/auth-cookies.ts` (Next-free) so `server/http` can use them.

## Questions

- A session that loses its only room reads `"X" moved to No location (was Room A)`
  in notices; common now with location deletes. Reword if wanted.

- `utils/guest-clashes.ts` imports `@/app/(site)/session_utils`, so `server/modules/`
  reaches `app/` transitively, which `server-does-not-reach-into-app` does not catch.
  Move the two helpers it uses to `packages/domain` or `utils/`.

## Next step

7b.
