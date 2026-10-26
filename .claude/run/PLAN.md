# Run plan: the remaining screen families move to the SPA (path step 5)

Goal: proposals and voting, people and meetings, the session forms, settings and
notifications, and admin move from Next to `apps/web`, as
[ADR 0015](../../docs/dev/adr/0015-spa-alongside-next.md) did for the schedule. At the
end, only the sign-in screens are Next pages. Every step leaves the app shippable.

Read first: ADR 0015, ADR 0014, `docs/dev/web-app.md`,
`docs/dev/target-architecture/04-client.md`, `docs/dev/server.md`, `docs/dev/testing.md`.

## Settled before the run (the user, 2026-10-24)

- ADR 0015 stays as written. Do not reopen its decisions.
- **Proposals and votes are in the replica**: public proposal fields and hosts in the
  snapshot and the feed; the viewer's own votes in `me.votes`, visible only to the
  voter. The vote breakdown stays an on-demand query (02-domain).
- **Failed commands tell the user what failed**, so that they can recover: the notice
  names the subject (a session by title, day, time and room; a proposal by title; a
  1-on-1 by the other person and slot). It tells "refused" (a `4xx`, with the reason)
  apart from "might not have been saved" (retries given up). It stays visible after the
  control that started it unmounts. First RSVPs and comments, then every new command.
- **The session forms move in this run**, after meetings; then the Next schedule goes.
- **The sign-in screens stay legacy** (guest password login, reset, `/login`, admin
  login) until path step 6 replaces them. No API for passwords.
- No pushes, no PRs. Commits stay local, stacked.

## Settled by the planner (the user may override)

- **Admin uses `queries/` and awaited mutations**, not the replica: admin data spans
  events and is not in any snapshot. A mutation waits for the response, maps problem
  details onto fields, shows `409` as "changed by someone else", then refetches.
- **Forms** (proposal, profile, session, settings, admin) use the same awaited mutation
  helper and the zod contracts per field (ADR 0003, #639). Votes, RSVPs, comments,
  likes and 1-on-1 answers are optimistic commands.
- **Addresses do not change**: the SPA keeps the legacy paths and query params
  (`viewProposal`, `viewMeeting`, `bookMeeting`, …), so emails, push, QR codes and
  bookmarks keep working.

## How to work (every step)

- **The legacy screen and its E2E specs are the specification.** Before a screen step,
  read the legacy components and the specs that cover them. Same behavior, copy and
  accessible names, unless this plan says otherwise. No redesign, no new features.
- **Build unrouted, then take over**, as steps 13 to 16 of the last run did: screens are
  built and tested through a test router (Vitest) while the catch-all still forwards to
  legacy. The takeover step routes them, points legacy links at them, deletes the Next
  pages, components and server actions (convert their tests to use cases or the API),
  and adapts the E2E specs only where URLs or markup really changed.
- **One copy of everything**: a piece two families need goes to `ui/` or a shared
  feature folder (comments serve sessions, proposals and profiles). A rule the server
  also runs goes to `packages/domain`, never a third copy.
- **Data**: features read the replica through selectors and call commands; `queries/`
  for paged, restricted or admin reads. Features never import `api-client` (the arch
  rule enforces it).
- Times in the event's zone. Every screen works at phone width.
- **Checks per step**: `make format lint arch openapi-check typecheck test`. Then,
  once the reviewer's findings are dealt with, the step's E2E specs (or full
  `make test-e2e` where the step says so). Doc-only steps skip E2E. Never
  `make test-e2e-docker` (user decision: only before a release). Check mailpit first.
- A step whose diff grows past ~1500 lines outside tests is split in PLAN.md first.

## Steps

### Baseline

- [x] 1. Full `make test-e2e` baseline: 213 passed; the one failure was the known `settings.spec.ts:67` load flake (passes alone).
- [x] 2. ADR 0016 written (remaining screen families, ADR 0014 amendment).

### Foundations

- [x] 3. `apps/web/src/schedule/` moved to `features/schedule/`; the arch rule found nothing to fix.
- [x] 4. Failure notices: `ui/notices.tsx`, `Command.describe`, runner `onFailure`, `failureMessage`; RSVP, comments and attendee count use them; the RSVP `AlertDialog` is gone.
- [x] 5. Forms: `awaitMutation`, `useFormMutation`, `validateFields` in `commands/`; `ui/form.tsx` fields.

### Proposals and voting

- [x] 6. Proposals and votes in the snapshot and feed: `proposal.created/changed/deleted` (event audience, no vote counts in the payload, host renames and joins record too), `me.votes`, `vote.cast`/`vote.withdrawn` (voter only; also recorded when a vote is lost by joining as host, by an edit adding the voter as host, or with the proposal). `apply` handles all, legacy and SPA copies.
- [x] 7. Replica and commands: `proposalsFrom`/`ownVotesFrom` selectors; the vote rule is `domain/vote-rule.ts` (phase, own proposal, membership), the server calls it and now refuses a host voting on their own proposal (`vote.ownProposal`); `castVote`/`withdrawVote` commands name the proposal in notices.
- [ ] 8. **Proposal screens**, unrouted:
  - [ ] 8a. The proposals list, split (the legacy table, cards, voting buttons, tally and
        action bar are ~1300 lines):
    - [x] 8a-1 (done: `features/proposals/list-model.ts`, `queries/proposal-standings.ts`, `voteStanding` on the API's proposal view; search uses `ui/plain-text`). The list model: filters (mine, voted, unvoted, host wanted), search
          (Fuse, same keys and threshold), sort, phase texts (`dateStartDescription`),
          the vote-tally query for the scheduling phase. Pure, unit tested. Blocked on
          PROGRESS.md Questions 1 and 2.
    - [x] 8a-2 (done: `features/proposals/proposals-screen.tsx`, `use-standings.ts`, links to legacy addresses; rendered directly in Vitest, no router since links are plain anchors; wiring to the replica/runner/query happens in step 9). The screen: action bar, table and mobile cards, voting buttons, empty
          state, through the test router.
  - [x] 8b. The proposal modal (done: `features/proposals/proposal-modal.tsx` with `ProposalActions`, `vote-breakdown.tsx`, `queries/proposal-detail.ts`, `commands/join-proposal.ts`; the session comments moved to `features/comments/` as the shared `Comments`).
  - [x] 8c. Quick voting (done: `features/proposals/quick-voting-screen.tsx`, `proposal-body.tsx` shared with the modal, `Comments` gained `readOnly`; `links.proposals`).
  - [x] 8d. New and edit proposal forms, delete (done: `features/proposals/proposal-form.tsx` with `commands/proposal-form.ts` calls, `ui/` `FormErrorSummary`, `PeopleField`, `MarkdownField`; the toolbar logic moved to `packages/domain/markdown-edit.ts`).
- [ ] 9. **Takeover: proposals**. Router owns `/{slug}/proposals/**` and
      `viewProposal`; the schedule's proposal links and `modal-nav.ts` point at it;
      legacy proposal pages, components and `proposals/actions.ts` are deleted. E2E:
      `proposals`, `proposal-comments`, `voting`, `phases`, `disabled-hints`, then full
      `make test-e2e`. CHANGELOG, `docs/public/`, release-notes highlight.

### People and meetings

- [ ] 10. **People screens**, unrouted:
  - [ ] 10a. The directory: list, search, same visibility as legacy.
  - [ ] 10b. The profile: details, hosting and proposals from the replica, meeting
        options; an API read for what the replica lacks replaces the
        `profile-activity.ts` server action.
  - [ ] 10c. Profile comments (the shared comments feature).
  - [ ] 10d. Edit my profile and photo (`PUT /me/profile`, avatar upload).
- [ ] 11. **Takeover: people**. Router owns `/guests/**`; legacy guest pages and
      `profile-activity.ts` are deleted. E2E: `attendee-profiles`, `profile`,
      `profile-comments`, `profile-photo`. CHANGELOG if anything visible changed.
- [ ] 12. **Meeting screens**, unrouted:
  - [ ] 12a. The meetings page: my availability (`PUT /meeting-availability`).
  - [ ] 12b. Booking (`bookMeeting`): candidates query, request command.
  - [ ] 12c. The meeting modal (`viewMeeting`): accept, decline, cancel commands with
        notices naming the other person and the slot; the meetings column opens it.
- [ ] 13. **Takeover: meetings**. `viewMeeting` and `bookMeeting` stop forwarding
      (`forwards-to-legacy.ts` goes); legacy meeting pages and components are deleted.
      E2E: `meetings-*`, then full `make test-e2e`. CHANGELOG.

### Session forms and the end of the Next schedule

- [ ] 14. **Session form**, unrouted: add and edit (rooms, real times on the minute
      grid, the break rule, co-hosts), scheduling a proposal into a session, delete and
      cancel. A saved session lands on the schedule with a confirmation notice (answers
      open question 3).
- [ ] 15. **Takeover: session forms**. Router owns `add-session` and `edit-session`; the
      legacy form, `session-actions.ts` and `clash-actions.ts` are deleted. E2E:
      `add-session`, `scheduling`, `update-session`. Record in PROGRESS.md whether the
      `scheduling.spec` flakes (open question 7) are gone.
- [ ] 16. **Retire the Next schedule** (old step 16b): the Next schedule page and its
      components, `replica/`, the RSVP overlay and `comment-actions.ts` are deleted;
      `session-comments.test.ts`, `session-comment-likes.test.ts` and the idempotency
      and guard tests move off `createSessionComment`. Utils only the legacy schedule
      used go too. Full `make test-e2e`.

### Settings and notifications

- [ ] 17. **Settings and notifications**, unrouted:
  - [ ] 17a. Settings: email settings, push subscriptions on this device, and what
        else the legacy page has.
  - [ ] 17b. Notifications: list, mark read, delete; the nav's unread indicator.
- [ ] 18. **Takeover: settings and notifications**. Router owns `/settings` and
      `/notifications`; legacy pages deleted. E2E: `user-settings`, `notifications`,
      `pwa`. CHANGELOG if anything visible changed.

### Admin

- [ ] 19. **Admin section shell**, unrouted: `/admin` layout and nav from the legacy
      admin header; the gate (an admin read answering `401`/`403` sends the browser to
      `/legacy/admin/login`); a data-table primitive in `ui/`.
- [ ] 20. **Admin screens**, unrouted, one commit each:
  - [ ] 20a. Events list: create, delete.
  - [ ] 20b. Event detail: details, phases, days, meeting settings and meeting points.
  - [ ] 20c. Event guests, event locations, room availability.
  - [ ] 20d. Event proposals and sessions managers.
  - [ ] 20e. Locations (image, order), guests and import, site settings, test email.
- [ ] 21. **Takeover: admin**. Router owns `/admin/**` except the login; `proxy.ts`
      keeps the admin gate on `/legacy/admin/login` and on the API; legacy admin pages
      are deleted, the login stays. E2E: `admin`, `meetings-admin`,
      `room-availability`, `settings`, then full `make test-e2e`. Self-hosting docs if a
      proxy rule changes. CHANGELOG.

### Close

- [ ] 22. **Docs**: `web-app.md`, `04-client.md`, `07-repo-and-rules.md`,
      `10-path-from-here.md` (step 5 done but for the sign-in screens),
      `docs/dev/server.md`, `open-questions.md` (resolve what this run answered);
      `docs/public/` and CHANGELOG read through; release notes kept to 3–5 highlights.
- [ ] 23. **Finish**: summary in PROGRESS.md, then delete `.claude/run/`.

## Next to plan

- Path step 6: identity and roles, the sign-in screens with it.
- Path step 7: retire Next.
