# Not built

Designs that were written down and are not in the code, and the questions still open. Nothing here
is committed to until an ADR adopts it. The earlier long form of the design is in the jj history of
`docs/dev/target-architecture/`.

## Designed, not built

- **Session kinds.** `Session` with a `kind` of session, shift (a volunteer slot with a minimum
  headcount and a "needs people" list) or fixture (an organizer item on everyone's agenda, such as a
  meal), plus latecomer and RSVP-requirement attributes.
- **Private marks and the personal agenda.** A star, hide or note per guest on a session, proposal
  or person, visible to nobody else (no query returns another guest's marks), and an agenda view
  that merges what a guest hosts, RSVPed to or starred, with clash groups.
- **Booking rules.** Reserved windows per place and time (organizer only, spontaneous sessions only
  from an hour before, a maximum length) and a per-day override of bookable places.
- **Places.** One `Place` model for rooms, areas, meeting points and "anywhere" (with a gathering
  point text), carrying floor, directions and a pin on the venue map. Today locations and meeting
  points are separate tables.
- **Other ways to sign in and be reached.** Passkeys, API tokens (hashed, scoped, revocable) for
  bots, a QR sheet of join links, chat channels (Telegram, Matrix, Signal) as outbound notification
  adapters behind the email and push ones.
- **Roles.** The `organizer` role on a participation, with per-event admin rights; today only the
  site-admin role exists.
- **The read setting** ([ADR 0017](../adr/0017-identity-and-roles.md) point 11): an event readable
  by `public`, by `link` (a secret event link, rotatable, hidden from the root list) or by
  `participants` (the default). With it comes a public read-only schedule without a login, a kiosk
  device link, and the end of `SITE_PASSWORD`.
- **Account export and deletion**, with deleted guests' changes anonymised, and a data collection
  statement generated from the schema.
- **Scheduled jobs table.** Reminders run as a loop job over the sessions' reminder rows; a general
  `scheduled_jobs` table does not exist.
- **Tooling for agents.** Module READMEs in a fixed template, scaffolds (`make new-use-case`), an
  ESLint rule that every use case calls a rule before it saves, and golden snapshots per role that
  fail when a field becomes visible to a new role.
- **Translation.** User-visible strings as keys with a catalogue; policies already return reason
  codes, but the sentences are written in the SPA.
- **`apps/server`.** The server stays at the repository root; moving it into `apps/` was drawn, not
  needed.

## Open questions

Numbered, each with a recommendation. When one is decided, put the outcome in the chapter it
affects, or in an ADR.

1. **Rate limit keying.** Claimed-name guests share one API bucket per address (burst 1000); at a
   venue behind one Wi-Fi address, or with `SB_TRUSTED_PROXIES` unset, all attendees share it.
   Recommendation: key by address plus guest cookie with a cap per address (a guest cookie is not
   tied to a login session, so any id buys a fresh bucket).
2. **Comment likes.** The SPA has neither the "Liked by" hover preview nor the avatars the old
   comments had. Recommendation: add both when comments are next touched; the data is in the
   snapshot already.
3. **A session that loses its only room** reads `moved to No location (was Room A)` in notices.
   Recommendation: reword to "no longer has a location (was Room A)".
4. **User menu** keyboard support: the roles copy the old markup without arrow keys. Recommendation:
   use the ARIA menu pattern when the menu is next changed.
5. **Picking a name without being a member.** The SPA picker offers only the snapshot's guests
   (members and hosts), because `GET /guests` is closed to anonymous visitors, so a non-member
   cannot pick their name. Recommendation: a public guest-name list for the picker that exposes
   names only.
