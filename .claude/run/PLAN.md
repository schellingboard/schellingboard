# Run plan: the remaining screen families move to the SPA (path step 5)

Goal: proposals and voting, people and meetings, the session forms, settings and notifications, and
admin move from Next to `apps/web`, as [ADR 0015](../../docs/dev/adr/0015-spa-alongside-next.md) did
for the schedule. At the end, only the sign-in screens are Next pages. Every step leaves the app
shippable.

Read first: ADR 0015, ADR 0014, `docs/dev/web-app.md`, `docs/dev/target-architecture/04-client.md`,
`docs/dev/server.md`, `docs/dev/testing.md`.

## Settled before the run (the user, 2026-10-24)

- ADR 0015 stays as written. Do not reopen its decisions.
- **Proposals and votes are in the replica**: public proposal fields and hosts in the snapshot and
  the feed; the viewer's own votes in `me.votes`, visible only to the voter. The vote breakdown
  stays an on-demand query (02-domain).
- **Failed commands tell the user what failed**, so that they can recover: the notice names the
  subject (a session by title, day, time and room; a proposal by title; a 1-on-1 by the other person
  and slot). It tells "refused" (a `4xx`, with the reason) apart from "might not have been saved"
  (retries given up). It stays visible after the control that started it unmounts. First RSVPs and
  comments, then every new command.
- **The session forms move in this run**, after meetings; then the Next schedule goes.
- **The sign-in screens stay legacy** (guest password login, reset, `/login`, admin login) until
  path step 6 replaces them. No API for passwords.
- No pushes, no PRs. Commits stay local, stacked.

## Settled by the planner (the user may override)

- **Admin uses `queries/` and awaited mutations**, not the replica: admin data spans events and is
  not in any snapshot. A mutation waits for the response, maps problem details onto fields, shows
  `409` as "changed by someone else", then refetches.
- **Forms** (proposal, profile, session, settings, admin) use the same awaited mutation helper and
  the zod contracts per field (ADR 0003, #639). Votes, RSVPs, comments, likes and 1-on-1 answers are
  optimistic commands.
- **Addresses do not change**: the SPA keeps the legacy paths and query params (`viewProposal`,
  `viewMeeting`, `bookMeeting`, …), so emails, push, QR codes and bookmarks keep working.

## How to work (every step)

- **The legacy screen and its E2E specs are the specification.** Before a screen step, read the
  legacy components and the specs that cover them. Same behavior, copy and accessible names, unless
  this plan says otherwise. No redesign, no new features.
- **Build unrouted, then take over**, as steps 13 to 16 of the last run did: screens are built and
  tested through a test router (Vitest) while the catch-all still forwards to legacy. The takeover
  step routes them, points legacy links at them, deletes the Next pages, components and server
  actions (convert their tests to use cases or the API), and adapts the E2E specs only where URLs or
  markup really changed.
- **One copy of everything**: a piece two families need goes to `ui/` or a shared feature folder
  (comments serve sessions, proposals and profiles). A rule the server also runs goes to
  `packages/domain`, never a third copy.
- **Data**: features read the replica through selectors and call commands; `queries/` for paged,
  restricted or admin reads. Features never import `api-client` (the arch rule enforces it).
- Times in the event's zone. Every screen works at phone width.
- **Checks per step**: `make format lint arch openapi-check typecheck test`. Then, once the
  reviewer's findings are dealt with, the step's E2E specs (or full `make test-e2e` where the step
  says so). Doc-only steps skip E2E. Never `make test-e2e-docker` (user decision: only before a
  release). Check mailpit first.
- A step whose diff grows past ~1500 lines outside tests is split in PLAN.md first.

## Steps

### Baseline

- [x] 1. Full `make test-e2e` baseline: 213 passed; the one failure was the known
      `settings.spec.ts:67` load flake (passes alone).
- [x] 2. ADR 0016 written (remaining screen families, ADR 0014 amendment).

### Foundations

- [x] 3. `apps/web/src/schedule/` moved to `features/schedule/`; the arch rule found nothing to fix.
- [x] 4. Failure notices: `ui/notices.tsx`, `Command.describe`, runner `onFailure`,
      `failureMessage`; RSVP, comments and attendee count use them; the RSVP `AlertDialog` is gone.
- [x] 5. Forms: `awaitMutation`, `useFormMutation`, `validateFields` in `commands/`; `ui/form.tsx`
      fields.

### Proposals and voting

- [x] 6. Proposals and votes in the snapshot and feed: `proposal.created/changed/deleted` (event
      audience, no vote counts in the payload, host renames and joins record too), `me.votes`,
      `vote.cast`/`vote.withdrawn` (voter only; also recorded when a vote is lost by joining as
      host, by an edit adding the voter as host, or with the proposal). `apply` handles all, legacy
      and SPA copies.
- [x] 7. Replica and commands: `proposalsFrom`/`ownVotesFrom` selectors; the vote rule is
      `domain/vote-rule.ts` (phase, own proposal, membership), the server calls it and now refuses a
      host voting on their own proposal (`vote.ownProposal`); `castVote`/`withdrawVote` commands
      name the proposal in notices.
- [ ] 8. **Proposal screens**, unrouted:
  - [ ] 8a. The proposals list, split (the legacy table, cards, voting buttons, tally and action bar
        are ~1300 lines):
    - [x] 8a-1 (done: `features/proposals/list-model.ts`, `queries/proposal-standings.ts`,
          `voteStanding` on the API's proposal view; search uses `ui/plain-text`). The list model:
          filters (mine, voted, unvoted, host wanted), search (Fuse, same keys and threshold), sort,
          phase texts (`dateStartDescription`), the vote-tally query for the scheduling phase. Pure,
          unit tested. Blocked on PROGRESS.md Questions 1 and 2.
    - [x] 8a-2 (done: `features/proposals/proposals-screen.tsx`, `use-standings.ts`, links to legacy
          addresses; rendered directly in Vitest, no router since links are plain anchors; wiring to
          the replica/runner/query happens in step 9). The screen: action bar, table and mobile
          cards, voting buttons, empty state, through the test router.
  - [x] 8b. The proposal modal (done: `features/proposals/proposal-modal.tsx` with
        `ProposalActions`, `vote-breakdown.tsx`, `queries/proposal-detail.ts`,
        `commands/join-proposal.ts`; the session comments moved to `features/comments/` as the
        shared `Comments`).
  - [x] 8c. Quick voting (done: `features/proposals/quick-voting-screen.tsx`, `proposal-body.tsx`
        shared with the modal, `Comments` gained `readOnly`; `links.proposals`).
  - [x] 8d. New and edit proposal forms, delete (done: `features/proposals/proposal-form.tsx` with
        `commands/proposal-form.ts` calls, `ui/` `FormErrorSummary`, `PeopleField`, `MarkdownField`;
        the toolbar logic moved to `packages/domain/markdown-edit.ts`).
- [x] 9a. **Takeover: proposals** (done: router owns `/{slug}/proposals/**`; `EventPage`,
      `ProposalsPage`/`QuickVotingPage`/`ProposalFormPage`, `SpaLinks` + `proposal-nav.ts`; legacy
      proposal pages and components deleted, `actions.ts` kept; likes preview and avatars ported to
      `Comments`).
- [x] 9b. Proposal legacy cleanup (done: `proposals/actions.ts` deleted; its tests now call /api/v1
      through `tests/helpers/proposal-api.ts`; the proposal idempotency tests live in
      `api-proposals.test.ts`; `VotesProvider`, `VotesContext` and `votes.ts` deleted,
      `vote-display` tests moved to `tests/unit`).
- [x] 9c. Legacy vote and proposal-comment leftovers deleted (`/api/votes`, `/api/add-vote`,
      `/api/delete-vote`, `votesApiUrl`, `createProposalComment`, `/api/proposal/*/comments`); their
      tests use /api/v1 (`voting.test.ts`, `api-rsvps-votes.test.ts`,
      `proposalApi().createProposalComment`).

### People and meetings

- [ ] 10. **People screens**, unrouted:
  - [x] 10a. The directory (done: `GET /attendees` site-wide, open like `GET /guests/{id}`;
        `queries/directory.ts`; `features/people/` model, `DirectoryScreen`, `PeopleLinks`;
        `ui/avatar.tsx`; attendee search, filters, profile helpers, relative time and
        accent-insensitive search moved to `packages/domain`).
  - [x] 10b. The profile (done: `features/people/profile-modal.tsx`, `profile-body.tsx`,
        `profile-photo.tsx`; `queries/profile-activity.ts` over new `GET /guests/{id}/activity` and
        `GET /guests/{id}/meeting-options`; `swipe.ts` moved to `packages/domain`). Hosting,
        proposals and meeting options come from the API, not the replica: the directory is
        site-wide, so there is no event replica on `/guests`, and they span every event.
  - [x] 10c. Profile comments (done: `ProfileModal` takes `comments(guestId, name)` and `setHash`,
        renders the shared `Comments` for the profile being read; `CommentSubject.name` names the
        profile in notices; `ProfileLinks.guest`).
  - [x] 10d. Edit my profile and photo (done: `features/people/profile-form.tsx`,
        `commands/profile-form.ts`, `ui/combobox.tsx`; the photo goes through
        `PUT`/`DELETE /me/avatar` before the profile).
  - [x] 10e. The 1-on-1 request form (done: `features/people/meeting-request-dialog.tsx`,
        `features/meetings/meeting-request-fields.tsx` shared with 12b,
        `commands/meeting-request.ts`; `ProfileModal` owns the dialog; `meeting-clash-text` moved to
        `packages/domain`). Legacy `meeting-picker.tsx` and its action are deleted at step 11.
- [x] 11. Takeover: people (done: router owns `/guests/**` through `app/people-pages.tsx`; legacy
      guest pages, `profile-activity.ts` and `actions/profile.ts` deleted; `GET /events` carries
      `now`, attendees carry `authProtected`).
- [ ] 12. **Meeting screens**, unrouted:
  - [x] 12a. My availability (done: `features/meetings/availability-form.tsx`,
        `commands/meeting-availability.ts`; `slotDaysFor` moved to `packages/domain`). It is the
        legacy Settings form; `availabilityFormFor(event, days, declared, now)` (domain) builds its
        data per event, dropping past events and narrowing `declared` to offered slots. Wired by the
        settings step.
  - [x] 12b. Booking (done: `queries/meeting-candidates.ts` over `GET /meeting-candidates`,
        `features/meetings/book-meeting.tsx`; the request command is 10e's `meetingRequestCalls`,
        the fields its shared `MeetingRequestFields`). Step 13 wires it: `profileHref` =
        `/guests/<id>`, `onBooked` refreshes the meetings column.
  - [x] 12c. The meeting modal (done: `features/meetings/meeting-modal.tsx`,
        `commands/meeting-answer.ts` with `answerMeeting`/`cancelMeeting`, optimistic and named in
        notices; the column's links already carry `viewMeeting`). Step 13 wires it.
  - [x] 12d. Clashes (done: `queries/meeting-clashes.ts` over `GET /meetings`, debounced refetch
        after a session, RSVP or meeting change; `app/use-meeting-clashes.ts`; `withClashes` merges
        into the column's and the modal's views).
- [x] 13. Takeover: meetings (done: the SPA schedule opens `?viewMeeting=`/`?bookMeeting=`
      (`features/schedule/meeting-modals.tsx`) and `/{slug}/meetings` is the notification landing
      (`app/meetings-page.tsx`); `forwards-to-legacy.ts`, the Next `meetings/page.tsx` and its test
      are gone. The legacy schedule's own meeting components (`meeting-modal`, `meetings-col`,
      `book-meeting`, `use-meetings`) stay until the Next schedule goes, step 16, with the legacy
      `readOnly` prop of `MeetingModalFromUrl`. Decisions: no CHANGELOG bullet, 1-on-1s added to the
      app-pages bullet; the booking's `onBooked` stays a no-op, the feed delivers the request and
      replays what a reconnect missed.)

### Session forms and the end of the Next schedule

- [x] 14. Session form (done: `features/sessions/` `SessionForm`, `session-model.ts`,
      `use-host-clashes.ts`; `commands/session-form.ts`; new `GET /host-clashes`; `Notice` gained
      `autoDismissMs`; `ui/back-link.tsx`).
- [x] 15. Takeover: session forms (done: router owns `/{slug}/add-session` and
      `/{slug}/edit-session` through `app/sessions-pages.tsx`; `scheduleLinks`/`proposalLinks` point
      at them; legacy form, page wrappers, `session-actions.ts`, `clash-actions.ts` and their
      orphans deleted; `guest-clashes.test.ts` calls `GET /host-clashes`; E2E helpers use
      `selectOption`).
- [x] 16. Retire the Next schedule (done: `[eventSlug]` directory, `replica/` and
      `comment-actions.ts` deleted; the comment tests call `/api/v1` through
      `tests/helpers/comment-api.ts`; `apply` moved to `packages/contracts/feed-apply.ts` and
      `RECONNECT_GRACE_MS` to `contracts/feed`; `newEmptySession`/`sessionsOverlap` to
      `packages/domain`; legacy utils, `EventContext` and their unit tests deleted).

### Settings and notifications

- [x] 17-18. **Settings and notifications** (done: `features/settings/`, `features/notifications/`,
      `app/account-pages.tsx`; the router owns `/settings` and `/notifications`; legacy pages and
      their actions deleted. Account security stays a small legacy page, `/legacy/account-security`,
      linked from Settings; the E2E dev toolbar's "Send due reminders" now lands there).

### Admin

- [x] 19. Admin section shell (done: `app/admin-frame.tsx` `AdminFrame`, `queries/admin-gate.ts`,
      `ui/data-table.tsx`, `POST /api/admin/logout`).
- [x] 20. **Admin screens**, unrouted, one commit each:
  - [x] 20a. Events list and create (done: `features/admin/events-screen.tsx`,
        `queries/admin-events.ts`, `commands/admin-events.ts`). Delete stays in the event detail's
        danger zone (legacy has it only there): 20b.
  - [ ] 20b. Event detail (legacy `events/[id]` is ~1500 lines for these, so split):
    - [x] 20b-1. Done: `features/admin/event-layout.tsx`, `event-config.tsx`,
          `queries/admin-event.ts`.
    - [x] 20b-2. Done: `features/admin/event-days.tsx`, `event-meetings.tsx`, new
          `GET /admin/events/{id}/meeting-points`.
  - [x] 20c. Done: `features/admin/` `assignment-manager.tsx` (shared by `event-guests.tsx`,
        `event-locations.tsx`), `location-availability.tsx`;
        `queries/admin-guests|locations|unavailability`.
  - [x] 20d. Event proposals and sessions managers (split: sessions is ~880 legacy lines):
    - [x] 20d-1. Done: `features/admin/event-proposals.tsx`, `list-paging.ts`,
          `queries/admin-proposals.ts`.
    - [x] 20d-2. Done: `features/admin/event-sessions.tsx`, `admin-session-model.ts`,
          `queries/admin-sessions.ts`.
  - [x] 20e. Split by page group:
    - [x] 20e-1. Done: `features/admin/locations-screen.tsx`, `commands/admin-locations.ts`,
          `sessionCount` in `GET /admin/locations`.
    - [x] 20e-2. Done: `features/admin/guests-screen.tsx`, `guest-import.tsx`,
          `commands/admin-guests.ts`.
    - [x] 20e-3. Done: `features/admin/settings-screen.tsx`, `commands/admin-settings.ts`,
          `queries/admin-settings.ts` (the test email went with the users list in 20e-2).
- [ ] 21. **Takeover: admin**. Router owns `/admin/**` except the login; `proxy.ts` keeps the admin
      gate on `/legacy/admin/login` and on the API; legacy admin pages are deleted, the login stays.
      `SettingsScreen.onSaved` must also reload the `AdminFrame` gate (site title). E2E: `admin`,
      `meetings-admin`, `room-availability`, `settings`, then full `make test-e2e`. Self-hosting
      docs if a proxy rule changes. CHANGELOG.

### Close

- [ ] 22. **Docs**: `web-app.md`, `04-client.md`, `07-repo-and-rules.md`, `10-path-from-here.md`
      (step 5 done but for the sign-in screens), `docs/dev/server.md`, `open-questions.md` (resolve
      what this run answered); `docs/public/` and CHANGELOG read through; release notes kept to 3–5
      highlights.
- [ ] 23. **Finish**: summary in PROGRESS.md, then delete `.claude/run/`.

## Next to plan

- Path step 6: identity and roles, the sign-in screens with it.
- Path step 7: retire Next.
