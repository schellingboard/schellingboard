# ADR 0022: Event access and people scope

- **Status:** Accepted
- **Date:** 2026-11-13, accepted 2026-11-13
- **Amends:** [ADR 0017](0017-identity-and-roles.md) point 11 (reading),
  [ADR 0014](0014-change-feed-and-snapshot.md) section 1 (the `event` audience)
- **Issue:** [#629](https://github.com/schellingboard/schellingboard/issues/629) (labels)

## Context

An event is a filter on shared tables, not a boundary. Anyone past the optional `SITE_PASSWORD` (or
anyone, without it) reads every guest's profile and contacts, every event's snapshot and feed, and
`guest.changed` reaches every connection of an event. Membership is a rule for writes and labels
only, and in `open` mode it is forgeable by picking a name.

Live labels (#629) exposed this: the directory is site-wide and has no feed, and the `event`
audience would show labels to non-members. A viewer-level feed was proposed. This ADR instead
decides what several events on one instance are for and scopes people to the event.

Almost every deployment runs one event and is torn down after it. Several events on one instance
exist for **related events of one organizer** (a main event and satellite workshops, two retreats in
a season): the same organizers, venue and much of the same community.

## Decision

1. **Purpose.** Several events on one instance serve related events of one organizer. Two cases are
   non-goals: a series across years (delete the data after the event, import again next year) and
   unrelated organizers on one instance (run one deployment each; one admin, one location pool and
   one database make isolation a matter of every query). The site admin stays global; per-event
   organizers stay out of scope.
2. **Two data tiers.** The **program** (event, days, sessions, times, rooms, host names, proposals,
   moments) follows the read setting. The **people** tier (directory, profiles, contacts, RSVP
   lists, labels, comments) is for insiders only and is never public. Contacts get no extra tier.
3. **Read setting per event:** `public` (program for anyone, people for insiders), `link` (a secret
   event link sets a cookie; rotatable; holders are insiders) or `participants` (signed-in members
   are insiders). A kiosk device link reads the program tier only.
4. **Allowed pairs** of read setting and identity mode: `link`+`open`, `link`+`verified`,
   `participants`+`verified`, `public`+either. `participants`+`open` is refused: the name picker
   would show the roster it protects, to anyone. The bare site shows public events and the sign-in
   form, never a name picker; after sign-in it also lists the person's events and those whose link
   cookie the browser holds.
5. **`SITE_PASSWORD` goes.** The event link replaces it with more entropy and nothing to type.
   People who do not keep the link set personal credentials.
6. **Admin settings, understood without docs.** Each event's admin settings choose the read setting
   and the identity mode, offering only the allowed pairs. Each choice states in plain words who can
   see the program, who can see people and how people get in. A change states its effect before it
   is saved ("everyone without the new link loses access"). The same screen shows and copies the
   event link and rotates it in one confirmed step, for when it leaks.
7. **Feed and snapshot.** Snapshot and feed check access at connect and refuse outsiders. The
   `event` audience splits into `program` and `insiders`; a program-only connection (public event,
   kiosk) gets neither people changes nor the people part of the snapshot.
8. **People are seen through an event.** The directory becomes an event screen, `/{slug}/people`;
   `/guests` goes. One profile per person stays. Activity, `isHost`, `openToMeetings` and RSVP lists
   are filtered to events the viewer may read. Profiles show no "also at" other events. 1-on-1s stay
   per event.
9. **A host is always a member.** Picking a non-member as host in the admin asks "Add X to this
   event?" (Add or Cancel). Removing a member who hosts asks the same. A migration adds existing
   non-member hosts to their events. "Shown in an event" then means "member".
10. **Profile comments belong to an event** (`event_id`), written and read in that event. Migration:
    the only event, otherwise the newest event the author and the subject share.
11. **Labels are public within the event.** Labels and label types travel in the snapshot's people
    tier and change through the event feed. No viewer-level feed, no per-label visibility; sensitive
    notes stay outside the app.
12. **Delete event** (admin, confirmed by typing the event name, showing the counts) deletes the
    event and all its data, and every member in no other event except site admins. "Keep locations"
    is on by default; cleared, it also deletes locations no other event uses. No undo; backups keep
    a copy until rotated, and the docs say so. Thirty days after the last day, the admin sees a
    reminder. Nothing is deleted automatically.
13. **Delete my account** is always in settings, disabled for unverified accounts with the reason
    ("add an email or a password first"), which makes trolling and mistakes harder and rewards
    protecting the account. After confirmation it deletes all the person's data; a session or
    proposal goes only when the person is its last host, otherwise the person leaves its hosts; the
    confirmation lists the items that will go. The last site admin cannot delete their account.

## Consequences

- Most leaks close at two gates (snapshot/feed connect and the people-tier read layer) instead of in
  every use case, but each people read path still needs the insider check and a test per role.
- Live labels need no new transport; #629's live part depends on the event directory (point 8).
- `open` events can no longer be read without the link; organizers of such events must share it.
- A link opened in a messenger's in-app browser sets its cookie there only; the attendee must open
  the link again in their browser or set credentials.
- Rotating a link ends read access for everyone who held it.
- A member of event A cannot see event B's people unless also inside B.

## Alternatives

- **A viewer-level feed for labels.** A new hub and resume over several events, for a directory that
  belongs to an event anyway.
- **One feed connection per visible event.** Six-connection limit, and traffic the directory
  ignores.
- **Per-event guest identities or per-event databases.** Real tenant isolation for a use case that
  is a non-goal, at the cost of a full migration of every guest reference.
- **Labels with an admins-only visibility.** Invites sensitive data into the app.
- **Account deletion only after the person's events are over.** Unclear when a person is in several
  events, and people can already delete their data step by step.

## Later

- Anonymized exports of an event (program without people, aggregates) before deleting it.
