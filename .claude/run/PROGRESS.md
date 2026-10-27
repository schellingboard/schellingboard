# Progress

## Decisions

- Session branch: `claude/spa-families`. No pushes (the user's rule).
- Planned 2026-10-24; the decisions in PLAN.md are the user's.

## Carried over from the SPA schedule run

- Known load-only E2E flakes: `settings.spec.ts:67` (`goto('/legacy/admin')` aborts),
  `scheduling.spec` edit, delete and cancel (about one run in four at 8 workers),
  `profile-comments.spec.ts:95`, `profile.spec:577`, `schedule-layout.spec:252`.
  Rerun alone before blaming a change.
- Open questions 1 to 8 in `docs/dev/target-architecture/open-questions.md`; this run
  answers 3 (step 14) and maybe 7 (step 15).

## Baseline (step 1)

- `make test-e2e`: 213 passed, 1 failed (`settings.spec.ts:67`, `goto('/legacy/admin')` abort). Rerun alone: passed. No regression from the last run.

## For later steps

- Failure notices (step 4): proposal and profile comments say only "your comment"; steps 8
  and 10 add the proposal title or profile name to `createComment`/`Target.describe`. New
  commands must give `describe` (subject by name); 1-on-1 commands name the other person
  and slot.
- No "Try again"/"open the session" action: a blind re-send gets a new idempotency key and
  bypasses the caller's bookkeeping. Revisit only with same-key resend through the caller.

- Forms: `ui/form-error-summary.tsx` (errors next to Save, jump to field by `name`) exists; fields take `name`.

- Step 6: snapshot `proposals` = public fields + hosts (names), no `sessionIds`/tally/breakdown; `me.votes` = `{proposalId, choice}`. Step 7 done: use `proposalsFrom`, `ownVotesFrom`, `castVote`, `withdrawVote`; `runner.view()` shows optimistic votes. Proposal comments still say only "your comment" (step 8b).

- Step 9a: `SpaLinks` intercepts in-event proposal links (pushes history; sets the
  opened-by-click flag from `proposal-nav.ts` when `viewProposal` is set, so closing goes
  Back). `tests/e2e/helpers/fixtures.ts` `isEventPage` also accepts `/{slug}/proposals…`.
  `Tooltip` (non-toggleable) now hides on click and opens on focus only if
  `:focus-visible`. Flake: `voting.spec.ts:115` fails first try under load (queue head
  changes while parallel tests add Beta proposals), passes alone.

Step 16: drop `eventSlug` and `revalidateEvent` from `comment-actions.ts` with the file (no live page needs them now that
proposals are SPA).

Step 10a, for step 11 (wiring): `DirectoryScreen({entries, status, now, viewerId, meetingsEnabled, randomSeed, links: PeopleLinks, params, onParams})`
with `useDirectoryQuery`-style loading still to do (`createDirectoryQuery({api})`, `refresh()` once per mount); `params`/`onParams` come from
`useUrlSearchParams` (`push` adds a history entry). `meetingsEnabled` = any event with meetings open (as the legacy layout). The profile modal
(10b) renders over the list as `ProposalModal` does over proposals; `links.guest(id, listQuery)` must then point at `/guests/<id>?<listQuery>`
(`legacyPeopleLinks` is the legacy address). Dropped: the legacy pager (never more than one page). Excerpts use `ui/plain-text`, cruder than the
server's parser.

## Questions

0. The SPA shell has no "Show map" button (the uploaded site map); only legacy pages show it. The
   schedule and proposals screens (both SPA-owned now) lost it when they moved.
   `settings.spec.ts:67` now checks it on `/legacy/guests`. Needs a shell item and the
   map URL in `/me` or the snapshot.

Assumptions the user may override (set by the coordinator, 2026-10-25):

1. Step 8a keeps both vote sorts. The proposals API sends `votesCount` (skips included) in
   the voting phase only, null otherwise; the scheduling sort derives from `tally`
   (interested x 4 + maybe), which is public then. Skips stay hosts-only (#370).
2. The tally and counts come from `queries/proposal-standings.ts` (`GET /proposals`,
   all pages), loaded once per mount by `useStandings(query)`: refetching on the viewer's
   own vote would move the voted row under the cursor. Other guests' votes show on reload.
3. 8a-2 built the screen on `list-model.ts` (`rowsFrom`, `listRows`, `defaultSort`,
   `sortOptions`, `phaseTexts`) and the vote buttons use `castVote`/`withdrawVote`.
   `vote-display.ts` and `phase-opens-text.ts` moved to `packages/domain`.

For step 8b/9: `ProposalsScreen` takes `snapshot` (use `runner.view()`), `standings` (from
`useStandings(createStandingsQuery(...))`), `onVote` (castVote/withdrawVote) and
`links` (`legacyProposalLinks`; the takeover swaps them). The legacy page's pagination
(1000 per page) was dropped: the list never exceeded one page. The "Add Proposal" empty-state
link and the list's title/description match the legacy copy.

Unavailable controls (006-US2): use `ui/unavailable.tsx` (`Unavailable blocked why`): aria-disabled,
described by the reason, a notice on activation. The takeover must adapt `disabled-hints.spec.ts`
to the notice region instead of the legacy toast helper if the markup differs.

Step 8b, for step 9 (wiring): `ProposalModal({proposalId, snapshot, now, localZone, links, actions, setHash, onClose})`
renders over the proposals list like `SessionModal` over the schedule: push `?viewProposal=` (Back
closes it when opened here, else remove the param), then update `modal-nav.ts` (anchor MnpjIo7Y) and
its legacy callers. `ProposalActions` = `vote` (castVote/withdrawVote), `join` (`joinProposal` command),
`detail` (`createProposalDetailQuery`), `comments` (`createCommentsQuery` + `createCommentsController`
with subject `{kind:"proposal"}`, as `schedule-page.tsx` does for sessions). Profile comments (10c) reuse
`features/comments/Comments`. `links.view(id)#comment-<id>` is the comment permalink. The detail query
runs only in the scheduling phase (before it both tally and breakdown are null).

Step 8c, for step 9 (wiring): `QuickVotingScreen({snapshot, links, now, localZone, standings, onVote, comments})`
takes the same `standings` (`useStandings`) and `onVote` as the list, and `comments: (proposalId) => CommentsHandle`
(`Comments readOnly`). The title link is `links.view(id)`; the legacy E2E "returns to the same place" needs the router to
push `?viewProposal=` over the quick-voting route and close back to it. Order = fewest `standing.total` first (0 until
standings load, so the first proposal can change once). `ProposalLinks.proposals` is the list address (back link).
`standingsStatus` = `useStandings(...).status`. Intended difference: quick voting's buttons are unavailable (with the reason) outside the voting phase; legacy never disabled them.

Step 8d, for step 9 (wiring): `ProposalForm({snapshot, proposalId?, links, actions: proposalFormCalls(api), onDone})`;
`onDone` navigates to `links.proposals` (legacy form did the same after save and delete). Routes `add` / `edit`
(`links.add`, `links.edit`) are the router's. Hosts are picked from the snapshot's members (the server refuses
non-members: `proposal.hostNotInEvent`), where legacy listed every guest. A new `Button variant="danger"`,
`ConfirmDialog cancelLabel`. Legacy `markdown-options.ts` now wraps `domain/markdown-edit.ts`; the legacy
textarea goes at the takeovers (11, 15). Not copied: legacy's lock/phase checks (the server refuses; the
reason shows), and the "Delete" trash icon.
