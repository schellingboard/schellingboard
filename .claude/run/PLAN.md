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

- [ ] **1. fix: RSVP clash dialog lists every clash** — `fixes #1042`. Replace `findRsvpClash` with
      a function that returns all overlapping commitments (sessions and accepted 1-on-1s), in
      start-time order. The dialog lists each one ("…, which you are hosting", "your 1-on-1 with
      X"). Bookmarks never trigger the dialog. Keep the function reusable: step 9 uses it.

- [ ] **2. fix: "now the host" email for a sole host** — `fixes #954`. When the recipient is the
      only host after the change, subject "You are now the host of: X" and matching body; otherwise
      keep the co-host wording.

- [ ] **3. feat: claim a hostless session** — `fixes #714`. Session modal shows "Become host" when
      the session has no hosts, is not admin-managed, the viewer is an event member, and hosts may
      edit sessions now (same rule as Edit). New server use case + `/api/v1` route (see
      `docs/dev/server.md`): adds the actor as the only host only if the session is still hostless
      (version check, else the usual "changed meanwhile" problem), records `session.changed`. No
      email to the claimer. Admin sessions list gets a "No hosts" filter.

- [ ] **4. feat: tell RSVPers when a session loses its last host** — `fixes #953`. Reaction on
      `session.changed` where `before` had hosts and `after` has none, whatever the cause (host
      edit, admin edit, guest deletion — which already records `session.changed`). Email + in-app
      notification to the RSVPers, under the same preference as session-changed. Text: the session
      has no host now; it may be cancelled or taken over; link to the session, where a member can
      become its host.

- [ ] **5. feat: confirm before moving a session people RSVP'd to** — `fixes #289`. In the session
      form, when editing a session with RSVPs and its time or room changed, Save first opens a
      confirm dialog: "N people RSVP'd to this session." plus whether they will be notified — check
      what `session-changed` really sends (e.g. duration-only changes) and say exactly that. No
      clash counting (others' RSVPs are private).

- [ ] **6. feat: "My schedule" filter** — `issue #865`. Replace the chips My sessions / RSVP'd /
      Hosting with one chip **My schedule**. Its label toggles it; a chevron beside it opens a small
      menu of checkboxes for the kinds it shows: RSVP'd, Hosting (both ticked by default). Kinds
      combine with OR; the chip combines with search and other chips with AND (as in the attendee
      directory). The last ticked kind cannot be unticked. Ticking a kind while the chip is off
      turns it on. Status line: "9 of 84 match · My schedule (RSVP'd, hosting)". URL: `filter=mine`,
      plus `mine=rsvpd` etc. only when not the default; old links `filter=rsvpd` / `filter=hosting`
      map to My schedule with that kind. Reuse an existing popover/menu from `apps/web/src/ui` if
      there is one; keyboard and screen reader accessible; works on phones.

- [ ] **7. feat: private session bookmarks** — `fixes #864`, `fixes #264`, `fixes #865`.
  - Data: table `session_marks` (guest, session, `kind` = `bookmark` | `hidden`, created at; unique
    per guest+session; cascade on session and guest delete). Create both kinds now, so step 8 needs
    no migration. One mark per session: setting one replaces the other.
  - Server: set/clear mark use cases and routes; event members only; no phase gate. Snapshot
    `me.marks`; feed `mark.set` / `mark.cleared`, audience: the owner. Add the row to the table in
    ADR 0014.
  - UI: in the session modal only, an icon-only bookmark toggle (heroicons `BookmarkIcon`: outline =
    not bookmarked, solid = bookmarked) next to the title, not in the action row. Label "Bookmark
    this session" / "Remove bookmark", tooltip "Only you see your bookmarks. This is not an RSVP."
    No bookmark button on grid blocks or agenda rows (too little space, looks like the RSVP badge,
    mis-taps on phones). Bookmarked blocks and agenda rows show a small solid bookmark icon before
    the title; no other style change (an un-RSVP'd bookmark stays dimmed).
  - My schedule menu gets a "Bookmarked" kind, unticked by default, listed only when the viewer has
    at least one bookmark (or it is ticked). URL kind `bookmarked`.
  - Not in the in-app release notes (keep discovery low); the changelog bullet is fine.

- [ ] **8. feat: hide sessions you are not interested in** — `fixes #1103`. Session modal: a quiet
      text button "Not interested" / "Show again", below the main actions; not offered when the
      viewer RSVP'd or hosts. A hidden mark is ignored while the viewer RSVP'd or hosts. Hidden
      sessions: grid shows them as ghosts (existing ghost style, no text, still open the modal,
      screen-reader text "hidden by you"), never count as matches; agenda leaves them out. A
      **Hidden** chip, shown only while the viewer has a hidden session or the chip is on, shows
      only hidden sessions; turning it on turns the other chips off and the other way round. URL
      `filter=hidden`.

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
