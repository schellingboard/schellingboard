# Plan: personal schedule planning and hostless sessions

Goal: attendees plan their own schedule (all clashes, "My schedule", bookmarks, hiding, clash
overview, deep links, an early read-only schedule), and a session never gets stuck without a host.

## Rules for every step

- One step = one commit, footer as given. TDD per AGENTS.md; tag tests with `tests/use-cases.ts`
  IDs. Update `CHANGELOG.md` and `docs/public/attendee-guide.md` (and the organizer guide where it
  applies) in the same commit.
- Checks: format, lint, arch, typecheck, `make test`, and the E2E specs the step touches or adds
  (run singly). The full E2E suite is run by the user at the end. Do not push.
- **RSVP is the commitment and stays the main action.** Bookmarks and hiding are quiet, private
  extras: no buttons for them on grid blocks or agenda rows, never in the RSVP action row, never
  counted, never visible to others or admins, no notifications, not in stats. If a UI choice would
  make a bookmark look like an RSVP, choose the quieter option.
- "Commitments" = sessions the viewer RSVP'd to or hosts, plus accepted 1-on-1s.
- **When a step is done**, in that step's commit (not a separate one): tick it (`- [x]`) and replace
  its whole text with one line — what was built and anything a later step relies on (names of
  reusable functions, routes, URL params). Details are in jj history. Example:

  ```
  - [x] **1. RSVP clash dialog lists every clash**: findClashes (schedule/clashes.ts) returns all commitments overlapping a session.
  ```

## Steps

- [x] **1. RSVP clash dialog lists every clash**: findClashes/describeClash/Clash
      (apps/web/src/features/schedule/clashes.ts) return all overlapping commitments in start order;
      takes busy sessions + meetings.

- [x] **2. "now the host" email for a sole host**: cohostAdded email takes `soleHost`
      (notifyCohostsAdded in utils/notifications.ts sets it when the session has one host); in-app
      text matches.

- [x] **3. claim a hostless session**: claimRefusal (packages/domain/src/session-claim.ts) is the
      shared rule; use case claimSession, `POST /api/v1/sessions/{id}/hosts` `{expectedVersion}`;
      command claimSession; `ScheduleActions.becomeHost`, `ScheduleData.isMember`; admin sessions
      `hostless=1` param.

- [x] **4. tell RSVPers when a session loses its last host**: notifySessionLostHost
      (utils/notifications.ts) called from the changeNotifications reaction before the cascade
      check; email `sessionLostHost`, setting rsvpChange.

- [x] **5. confirm before moving a session people RSVP'd to**: session form
      (features/sessions/session-form.tsx) opens a ConfirmDialog when start, end or rooms change and
      `snapshot.counts[id] > 0`.

- [x] **6. "My schedule" filter**: filters.ts has `ScheduleFilterState {mine: kinds|null}`,
      `MINE_KINDS`, `ALL_KINDS`, parse/serialize (`filter=mine`, `mine=rsvpd|hosting`, legacy values
      mapped); `MyScheduleChip` (schedule-filters.tsx) is the chip + kinds menu to extend with
      Bookmarked; e2e `filterChip` helper matches exactly.

- [x] **7a. private session marks, data and server** (`issue #864`): table `session_marks`
      (migration 0060, both kinds), `SessionMarksRepository` (`tx.sessionMarks`), use cases
      setSessionMark/clearSessionMark, `PUT|DELETE /api/v1/sessions/{id}/marks/{guestId}`
      (`{kind}`), changes `mark.set`/`mark.cleared` (owner-only), snapshot
      `me.marks: {sessionId, kind}[]`, use case 007-US9; session.deleted drops marks in feed-apply.

- [x] **7b. private session bookmarks, UI**: commands addBookmark/removeBookmark
      (commands/session-mark.ts), `ScheduleActions.setBookmark`,
      `ScheduleData.bookmarked`/`hasBookmarks`; filters.ts `MINE_KINDS` has `bookmarked` (not
      default, `DEFAULT_KINDS`); modal `BookmarkToggle`; `BookmarkSolidIcon` marks blocks/rows. Step
      8 reuses `snapshot.me.marks` kind `hidden`.

- [x] **8. hide sessions you are not interested in** (`fixes #1103`): commands
      addHidden/removeHidden, `ScheduleActions.setHidden`, `ScheduleData.hidden`/`hasHidden`
      (ignored while RSVP'd or hosting), `ScheduleFilterState.hidden` (`filter=hidden`, excludes
      `mine`), `ScheduleMatch.hides`; use case 007-US10. Step 9: Clashes chip can reuse the chip row
      (`hidden` prop pattern in schedule-filters.tsx); hidden sessions must stay out of its set.

- [ ] **9. feat: show clashes in your schedule** — `fixes #1104`. A **Clashes** chip, shown when the
      viewer has at least one clash or the chip is on. It matches sessions in RSVP'd ∪ hosting ∪
      bookmarks (not hidden) that overlap another of those or an accepted 1-on-1, and those 1-on-1s.
      With My schedule on, it narrows to its ticked kinds. Blocks of commitments that clash with
      another commitment get a small warning icon (tooltip / sr text names the clashes, via step 1's
      function); bookmarks never get the icon. URL `filter=clashes`.

- [ ] **10. feat: a session link shows the session on the schedule** — `fixes #994`. When the
      schedule opens with `viewSession` from an address (not opened in-app), unfold the session's
      day if folded and scroll the grid or agenda so the session is centred behind the modal
      (instant). This wins over scroll restoration for that load. In-app opening is unchanged.

- [ ] **11. refactor: the schedule moves to `/<slug>/schedule`** — `issue #1336`. `/<slug>` only
      redirects (replace, no history entry): to `/<slug>/schedule` with the same search params if it
      has any (`viewSession`, `view`, `filter`, `loc`, …) or scheduling has started (the event has
      no phases, or now ≥ `schedulingPhaseStart`); else to `/<slug>/proposals`. Stored notification
      links and old emails keep working. All in-app links and new emails use `/<slug>/schedule`. No
      behaviour change otherwise.

- [ ] **12. feat: read-only schedule before scheduling opens** — `fixes #1336`.
  - Landing: step 11's redirect keeps opening the event on the proposals list before scheduling
    starts (discovery). The schedule shows only when the attendee chooses it (its nav link, a
    session link). The Schedule nav link shows in every phase.
  - Read-only: one domain helper decides it: the event has phases and scheduling has not started
    (any phase or inactive gap before it, e.g. voting ended but scheduling not open) or has ended.
    Today an inactive gap shows "Event unavailable"; make before, gap and after consistent. No
    bookable free slots, no RSVP, Edit or Become host; 1-on-1s stay off. Notice at the top:
    "Scheduling opens on <date in the event's time zone>." — only when `schedulingPhaseStart` is set
    and in the future. Bookmarks and hiding work.
  - Candidate in-app release note.

## Not in this batch

#1105, #1110 (undecided ideas). Already done, for the user to close: #678 (grid search), #1144 (host
picker lists members only); #463 refers to the removed legacy app — verify, then close.

## Next steps

None.
