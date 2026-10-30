# Progress

## Decisions

- Session branch: `claude/spa-families`. No pushes (the user's rule).
- Planned 2026-10-24; the decisions in PLAN.md are the user's.

## Carried over from the SPA schedule run

- Known load-only E2E flakes: `settings.spec.ts:67` (`goto('/legacy/admin')` aborts),
  `scheduling.spec` edit, delete and cancel (about one run in four at 8 workers),
  `profile-comments.spec.ts:95`, `schedule-layout.spec:252`. Rerun alone before blaming a change.
- Open questions 1 to 8 in `docs/dev/target-architecture/open-questions.md`; this run answers 3
  (step 14) and maybe 7 (step 15).

## Baseline (step 1)

- `make test-e2e`: 213 passed, 1 failed (`settings.spec.ts:67`, `goto('/legacy/admin')` abort).
  Rerun alone: passed. No regression from the last run.

## For later steps

- Failure notices (step 4): comments name their proposal or profile (`CommentSubject.name`); New
  commands must give `describe` (subject by name); 1-on-1 commands name the other person and slot.
- No "Try again"/"open the session" action: a blind re-send gets a new idempotency key and bypasses
  the caller's bookkeeping. Revisit only with same-key resend through the caller.

- Forms: `ui/form-error-summary.tsx` (errors next to Save, jump to field by `name`) exists; fields
  take `name`.

- Step 6: snapshot `proposals` = public fields + hosts (names), no `sessionIds`/tally/breakdown;
  `me.votes` = `{proposalId, choice}`. Step 7 done: use `proposalsFrom`, `ownVotesFrom`, `castVote`,
  `withdrawVote`; `runner.view()` shows optimistic votes.

- Step 9a: `SpaLinks` intercepts in-event proposal links (pushes history; sets the opened-by-click
  flag from `proposal-nav.ts` when `viewProposal` is set, so closing goes Back).
  `tests/e2e/helpers/fixtures.ts` `isEventPage` also accepts `/{slug}/proposals…`. `Tooltip`
  (non-toggleable) now hides on click and opens on focus only if `:focus-visible`.

Step 10a, for step 11 (wiring):
`DirectoryScreen({entries, status, now, viewerId, meetingsEnabled, randomSeed, links: PeopleLinks, params, onParams})`
with `useDirectoryQuery`-style loading still to do (`createDirectoryQuery({api})`, `refresh()` once
per mount); `params`/`onParams` come from `useUrlSearchParams` (`push` adds a history entry).
`meetingsEnabled` = any event with meetings open (as the legacy layout). The profile modal (10b)
renders over the list as `ProposalModal` does over proposals; `links.guest(id, listQuery)` must then
point at `/guests/<id>?<listQuery>` (`legacyPeopleLinks` is the legacy address). Dropped: the legacy
pager (never more than one page). Excerpts use `ui/plain-text`, cruder than the server's parser.

Step 10b, for step 11 (wiring):
`ProfileModal({guestId, matches, everyone, viewerId, links, activity, onOpen, onClose, onSchedule})`
renders over `DirectoryScreen`. `matches` = `directoryView(...).rows`, `everyone` =
`everyoneIn(cards)`, computed by the page with the screen's `seed`/`params` (lift the memo or share
a hook). `activity` = stable `(id) => createProfileActivityQuery({api, guestId: id})`. `onOpen(id)`
pushes `/guests/<id>?<listQuery>` (keep the list query); `onClose` pushes the list, not Back.
`onSchedule` was replaced in 10e by `meetingRequests: meetingRequestCalls(api)`; the modal opens the
request dialog itself. `legacyProfileLinks` = today's addresses. `brand-icons` exist twice until
step 11. `ui/markdown` gained bare-URL/e-mail links, mailto/tel, numbered lists, quotes and headings
as bold lines (no react-markdown by choice). `meetingOptionsFor` takes an optional `now`.

Step 10c, for step 11 (wiring): pass `comments={(id, name) => open({kind: "profile", id, name})}`
(stable; `useCommentSource` with a runner). `/guests` has no event replica: the runner still needs a
store (any snapshot; profile notices do not read it), and `useCommentSource(api, runner, liker)` now
takes the liker, from `likerFrom(snapshot)` or from `/me` there. `setHash` as for proposals.
`links.guest(id)` is the bare profile address: comment authors link to it, so the router must keep
the list query across it (E2E "opens a comment author's profile": closing lands on the list it
started from). Timestamps are UTC-anchored, as legacy.

Step 10d, for step 11 (wiring):
`ProfileForm({profile: ProfileDraft, links: {people, settings}, actions: profileFormCalls(api), onDone})`;
`profile` = the viewer's `DirectoryEntry` (needs `version`; load it fresh, e.g. `GET /guests/{id}`).
`onDone` navigates to the viewer's profile (legacy did). The photo is sent first (`PUT /me/avatar`,
then the profile against the new version): if the profile then fails, the photo stays changed and
the form says so. Markup changes (sections are buttons with `aria-expanded`; pronoun/language fields
are `ui/combobox`, role combobox/option) should not force `profile.spec` rewrites; the "Suggest a
different prompt" button is an icon with that name. If the profile save fails after the photo saved,
the form says so. `avatar-image` and `language-suggestions` moved to `packages/domain`.

Steps 17-18: `PageNotice` (`app/page-notice.tsx`) is the shared "select who you are" notice. The
legacy layout still has a dev toolbar and nav bar, so E2E specs that need them (a legacy-only dev
tool, "Show map") land on `/legacy/account-security`. `AccountSecurity` must go when path step 6
brings passwords to the SPA.

Step 19, for 20/21: `AdminFrame({api, currentPath, search, children})` wraps every admin page: it
makes the gate read (`GET /admin/settings`), renders children only once open, sends 401/403 to
`/legacy/admin/login?redirect=<path+search>` (`hardNavigate`) and shows the site title and the nav
(`/admin/events|users|locations|settings`, plain anchors; the router must pass `currentPath`).
Logout is `POST /api/admin/logout` (new route; the legacy server action cannot be called). The
`DataTable` is controlled: `searchQuery`/`onSearch`/`page`/`onPage` come from the page's URL params
(`useUrlSearchParams`), not from the table; `Selection` and `BulkActionsBar` moved with it. The
legacy `useTableParams` has no copy; its `shallow` mode is just "the page filters rows in memory".
`onSearch(query, {replace})` and `searchParamUpdates(query)` (`ui/data-table`) carry the legacy
history rules: a search resets `page`, the first one pushes a history entry, refinements replace.
Step 21 must delete `app/legacy/admin/data-table.tsx`. A page that gets 401/403 later from a
mutation should do what the gate does (not built yet).

Step 20a, for 20b/21: `AdminEventsScreen({status, events, calls: adminEventCalls(api), onCreated})`
inside `AdminFrame`; the page owns `createAdminEventsQuery` (`load()` on mount and in `onCreated`;
`status` = its state's). The list reads `GET /events` (public, all events) and is the legacy plain
list: no search or paging. The delete (type the name to confirm, `DELETE /admin/events/{id}`)
belongs to 20b. `parseSettings`/`createEvent` now refuse with `errors[]` (`name`, `timezone`,
`maxSessionDuration`, `breakMinutes`, `slotIncrementMinutes`, `icon`; a taken URL is a 409 with
`errors` on `name`), so `useFormMutation` puts the reason next to the field; 20b's update reuses it.
`features/admin/timezones.ts` has the zone list. `ui/form` labels render "Name*" where legacy said
"Name *": `admin.spec.ts` uses `getByLabel("Name *")` and needs `getByLabel("Name")` at step 21.

Step 20b-1, for 20b-2/21: `createAdminEventQuery({api,id})` (`GET /events/{id}`; state `ready`
spreads `{event, days}`; `load()` keeps the old state while reloading, so forms stay mounted).
`AdminEventLayout({status, event, currentPath, children})` is the page frame (back link, name, tabs
as plain anchors to `/admin/events/{id}[/guests|locations|proposals|sessions]`). Config tab:
`EventConfigTab({event, calls: adminEventCalls(api), onChanged: query.load, onDeleted})`; the page
sends `onDeleted` to `/admin/events`. Add the meetings form and `EventDaysManager` to it (20b-2),
inside the same `max-w-3xl` column except the wide days table. Each form wraps `useEventSection`
(copy of legacy; sections share the event version) and `useSectionSave` (a 409 shows
`STALE_EVENT_MESSAGE` and calls `onChanged`; reuse it for meetings/days). `admin-datetime` moved to
`packages/domain/src/admin-datetime.ts` (+ `zonedInputToInstant`), `eventIconLabel` to
`domain/event-icons`. The icon picker is text-labelled radios ("Rocket Launch"): the SPA has no
heroicons; legacy showed glyphs with the same accessible names. Step 21: `admin.spec` needs
`getByLabel("Name")` for the "Name *" label, and "Timezone *"/"Max session duration" similar.

Step 20b-2, for 21: the Config tab is complete.
`EventConfigTab({event, days, points, sessions, calls, onChanged, onPointsChanged, onDeleted})`; the
page owns three queries: `createAdminEventQuery` (event + days),
`createAdminMeetingPointsQuery({api,id})` (new `GET /admin/events/{id}/meeting-points`, admin only,
integration tested) and `createAdminScheduledSessionsQuery({api,eventId})` (pages `GET /sessions`;
feeds the day-delete warning). `onChanged` must `load()` the event and the sessions queries (a day
delete removes sessions); `onPointsChanged` loads the points. Render the Config tab only once all
three are ready. `useFormMutation({explainRefusals: true})` (opt-in, admin screens) shows the
server's `detail` for a refusal with no wording of its own; `features/admin/use-section-save.ts`
holds `useSectionSave`, `jumpTo`, `useJumpWithin`, `shown`. E2E label changes for step 21: the
labels "Start", "Name" etc. now carry a trailing star without a space (use a `getByLabel("Start")`
regex).

Step 20c, for 21: the Guests and Locations tabs. Pages own `createAdminGuestsQuery({api})` (all
pages of `GET /admin/guests`), `createAdminLocationsQuery({api})` (`GET /admin/locations`) and
`createAdminUnavailabilityQuery({api,eventId})`; each `load()`s on mount and in `onChanged`. Search,
the Assigned filter and 25-row paging run in memory (no server paging). Props:
`EventGuestsManager({eventId, guests, params, onParams, calls, onChanged})` and
`EventLocationsManager` alike: `params` = `useUrlSearchParams().params`, `onParams(updates, {push})`
applies `updates` (null deletes) to them and calls `change(next, {push})`. The Locations tab also
renders `LocationAvailabilityManager({eventId, periods, rooms, days, timezone, calls, onChanged})`:
`rooms` = locations whose `eventIds` has the event, `days` from the event query, `periods` from the
unavailability query. Rows sort by name (case-insensitive) then id; a page past the end is clamped
to the last (legacy redirected). `admin.spec.ts:877` expects "Request failed" when a bulk action
cannot reach the server; the SPA says "This might not have been saved…". Step 21: the legacy
`room-checkboxes.tsx` stays for the sessions manager (20d may reuse the SPA copy in
`features/admin/room-checkboxes.tsx`).

Step 20d-1, for 21: the Proposals tab. The page owns `createAdminProposalsQuery({api,eventId})`
(`GET /proposals`, all pages; `load()` on mount and in `onChanged`) and the guests query of 20c;
`EventProposalsManager({proposals, guests, params, onParams, calls, onChanged})` with `guests` = the
guests whose `eventIds` has the event, as `{id,name}`. `list-paging.ts` holds the shared pieces
(`pageOf`, `tableHandlers`, `byTitleThenId`, `OnParams`); assignment-manager uses them too. Sorted
by title (case-insensitive) then id, search on title or host name, as legacy. E2E changes: the
labels "Title *" and "Hosts" become `getByLabel("Title")` (the star has no space) and the title
field is a plain `ui/form` field; the stale-page redirect test (`?page=999`) now clamps without a
redirect, so its `not.toHaveURL(page=999)` assertion fails: assert the first row shows instead. The
delete warning names the vote count only in the voting phase (the API sends `votesCount` then only);
otherwise it says "its votes". Question for the user: have the admin API send the count always?

Step 21 must delete the legacy `use-event-section.ts` (untested now; the SPA copy has the test).

## Questions

5. The SPA shell has no "Show map" button (the uploaded site map); only legacy pages show it. The
   schedule and proposals screens (both SPA-owned now) lost it when they moved.
   `settings.spec.ts:67` now checks it on `/legacy/account-security`. Needs a shell item and the map
   URL in `/me` or the snapshot.

Assumptions the user may override (set by the coordinator, 2026-10-25):

1. Step 8a keeps both vote sorts. The proposals API sends `votesCount` (skips included) in the
   voting phase only, null otherwise; the scheduling sort derives from `tally` (interested x 4 +
   maybe), which is public then. Skips stay hosts-only (#370).
2. The tally and counts come from `queries/proposal-standings.ts` (`GET /proposals`, all pages),
   loaded once per mount by `useStandings(query)`: refetching on the viewer's own vote would move
   the voted row under the cursor. Other guests' votes show on reload.
3. 8a-2 built the screen on `list-model.ts` (`rowsFrom`, `listRows`, `defaultSort`, `sortOptions`,
   `phaseTexts`) and the vote buttons use `castVote`/`withdrawVote`. `vote-display.ts` and
   `phase-opens-text.ts` moved to `packages/domain`.

For step 8b/9: `ProposalsScreen` takes `snapshot` (use `runner.view()`), `standings` (from
`useStandings(createStandingsQuery(...))`), `onVote` (castVote/withdrawVote) and `links`
(`legacyProposalLinks`; the takeover swaps them). The legacy page's pagination (1000 per page) was
dropped: the list never exceeded one page. The "Add Proposal" empty-state link and the list's
title/description match the legacy copy.

Unavailable controls (006-US2): use `ui/unavailable.tsx` (`Unavailable blocked why`): aria-disabled,
described by the reason, a notice on activation. The takeover must adapt `disabled-hints.spec.ts` to
the notice region instead of the legacy toast helper if the markup differs.

Step 8b, for step 9 (wiring):
`ProposalModal({proposalId, snapshot, now, localZone, links, actions, setHash, onClose})` renders
over the proposals list like `SessionModal` over the schedule: push `?viewProposal=` (Back closes it
when opened here, else remove the param), then update `modal-nav.ts` (anchor MnpjIo7Y) and its
legacy callers. `ProposalActions` = `vote` (castVote/withdrawVote), `join` (`joinProposal` command),
`detail` (`createProposalDetailQuery`), `comments` (`createCommentsQuery` +
`createCommentsController` with subject `{kind:"proposal"}`, as `schedule-page.tsx` does for
sessions). Profile comments (10c) reuse `features/comments/Comments`. `links.view(id)#comment-<id>`
is the comment permalink. The detail query runs only in the scheduling phase (before it both tally
and breakdown are null).

Step 8c, for step 9 (wiring):
`QuickVotingScreen({snapshot, links, now, localZone, standings, onVote, comments})` takes the same
`standings` (`useStandings`) and `onVote` as the list, and
`comments: (proposalId) => CommentsHandle` (`Comments readOnly`). The title link is
`links.view(id)`; the legacy E2E "returns to the same place" needs the router to push
`?viewProposal=` over the quick-voting route and close back to it. Order = fewest `standing.total`
first (0 until standings load, so the first proposal can change once). `ProposalLinks.proposals` is
the list address (back link). `standingsStatus` = `useStandings(...).status`. Intended difference:
quick voting's buttons are unavailable (with the reason) outside the voting phase; legacy never
disabled them.

Step 8d, for step 9 (wiring):
`ProposalForm({snapshot, proposalId?, links, actions: proposalFormCalls(api), onDone})`; `onDone`
navigates to `links.proposals` (legacy form did the same after save and delete). Routes `add` /
`edit` (`links.add`, `links.edit`) are the router's. Hosts are picked from the snapshot's members
(the server refuses non-members: `proposal.hostNotInEvent`), where legacy listed every guest. A new
`Button variant="danger"`, `ConfirmDialog cancelLabel`. Legacy `markdown-options.ts` now wraps
`domain/markdown-edit.ts`; the legacy textarea goes at the takeovers (11, 15). Not copied: legacy's
lock/phase checks (the server refuses; the reason shows), and the "Delete" trash icon.

Step 10e: legacy `requestMeetingAction` stays (used by `book-meeting.tsx` until step 13).
`MeetingRequestFields` lost `cancelLabel` (12b may need it back).

Step 11: `/guests/**` is the SPA's (`app/people-pages.tsx`, blank store from `replica/blank.ts`,
viewer from `/me`). `app/components/avatar.tsx` is a shared legacy file (moved out of the deleted
guests directory) until the legacy pages go. Do not call `runner.stop()` or `query.destroy()` in a
mount effect cleanup: StrictMode re-runs the effect on the same object and leaves it dead.
`tests/e2e/helpers/fixtures.ts` opens `/guests*` as it is (not under `/legacy`). The settings map
check uses `/legacy/account-security`. The SPA shell still lacks "Show map". A
protected-but-unverified name on the edit page shows the "select who you are" copy.

Step 12b, for 13: `BookMeeting({query, calls, eventId, slotStart, profileHref, onBooked, onClose})`;
`query` = stable `createMeetingCandidatesQuery`, `calls` = `meetingRequestCalls(api)`. 10e's dialog
failure text does not name the person/slot (12b's does); revisit if wanted.

Step 12c, for 13:
`MeetingModal({meeting, now, readOnly, profileHref, onAnswer, onCancel, onClose})`, rendered with
`key={meetingId}` and only once the replica and `me` are loaded (before that it would say "1-on-1
not found."); `meeting` = `meetingViewsFrom(runner.view(), now)` merged with clashes (12d)
`.find(id)`, `onAnswer = r => runner.run(answerMeeting, {meetingId, response: r})`,
`onCancel = note => runner.run(cancelMeeting, {meetingId, note})`; close drops `viewMeeting`
(`SpaLinks` must stop forwarding it). `commands/meeting-answer.ts` imports from `features/schedule`
(known layering exception).

Step 12d: `useMeetingClashes(api, snapshot)` feeds `ScheduleScreen`'s `clashes` prop (the column).
For the modal in 13, merge the same map: `withClashes(meetingViewsFrom(...), clashes)`.

Step 13: legacy schedule keeps its own meeting components until the Next schedule is deleted. A
visitor with no `me` who opens `?viewMeeting=` on the schedule sees no modal (legacy said 'select
who you are'); `/{slug}/meetings` does show that message.

Step 15: `legacyScheduleLinks` is now `scheduleLinks` (all addresses are the SPA's; `schedule` is
`/{slug}`). Open question 3 is answered (notice survives navigation); `scheduling.spec` flakes
(question 7): not seen in three runs of the touched specs, which is encouraging but not conclusive;
the hop from the SPA to a legacy form is gone. Native `<option>` is not "visible" in Firefox: E2E
use `toBeAttached()` / `toBeDisabled()` on `startTimeOption`. The legacy API routes
`/api/add-session` and `/api/update-session` stay (tests use them). The pwa "old root link" test now
uses `/settings`, since no event-scoped legacy page is left to forward to.

Step 16: `GET /host-clashes` takes at most 20 guest ids. Dead leftovers left alone (own step if
wanted): `revalidatePath("/legacy/<slug>", "layout")` calls in `app/actions/admin-*.ts` (asserted by
`admin-sessions.test.ts`), the `toggleCommentLike` use case (still unit tested), and the legacy
`/api/toggle-rsvp`, `/api/add-session`, `/api/update-session` routes (tests use them). The legacy
meeting request/respond/cancel actions went; `modal-nav` anchor MnpjIo7Y now lives in
`docs/dev/web-app.md` (AGENTS.md "Misc" still names `modal-nav.ts`: needs the user's edit).
