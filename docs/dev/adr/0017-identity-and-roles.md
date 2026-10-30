# ADR 0017: Identity and roles

- **Status:** Accepted
- **Date:** 2026-10-28, accepted 2026-10-29

## Context

[Path step 6](../target-architecture/10-path-from-here.md) replaces the cookies that say who a
browser is, and the shared admin password, with server-side login sessions, a site-admin role and
join links ([05](../target-architecture/05-security.md), D1, D2, D11 in
[08](../target-architecture/08-decisions.md)). The sign-in screens are the last Next pages. This ADR
settles the shapes before the work starts, and amends [ADR 0016](0016-remaining-screen-families.md)
point 4.

## Decision

1. **No rename.** `guests` stays the person table and `event_guests` the participation; code keeps
   the word "guest". The glossary's terms (Person, Participation) are used in docs only.
2. **Login sessions are rows:**
   `login_sessions(id hash, guest, event?, assurance, created, expires, lastSeen, device)` (05's
   table, with `device` added). The `guest` cookie holds only the opaque id; revoking is a row
   delete. Picking a name creates a `claimed` row; an emailed code, a password or a join link a
   `verified` one. `resolveActor` reads the row, and a protected guest can be acted as only through
   a `verified` row. A row expires 30 days after its last use (`lastSeen`, refreshed at most once a
   day), so a person signs in once per device, not once per visit. The jobs loop prunes expired
   rows.
3. **Old cookies are not honoured.** The `open.` and `verified.` values read as no identity, so the
   upgrade signs everyone out once. The release notes say so; organizers upgrade between events.
4. **Credentials:** password, emailed login code, reset link, join link. Email is optional per
   person, since a deployment need not send mail. A person may hold an optional unique `username`;
   password sign-in takes the email or the username. The password hash stays scrypt (`node:crypto`,
   no native module); [05](../target-architecture/05-security.md) says argon2id and is updated. The
   stored format (`scrypt$salt$key`) holds no cost parameters; it will carry N/r/p so cost can rise
   later. Passkeys and API tokens wait for a later plan.
5. **Sign-in API** under `/api/v1/auth/` (request a code, log in with code or password, reset, sign
   out) and `/api/v1/me/credentials`, `/api/v1/me/login-sessions`. Strict rate limits and Origin
   checks, as for the admin API. Problem codes name a wrong credential (a wrong, expired or spent
   password or code are one code, so a guess learns nothing) and too many attempts. **This amends
   ADR 0016 point 4** ("no API for passwords"): the API now exists, because the SPA's sign-in
   screens use it.
6. **Token rules.** Login-session ids, codes, reset tokens and join tokens are random and stored
   only as sha256 hashes: 32 random bytes for ids and reset or join tokens; the emailed code is 8
   characters (~40 bits, per-code salt) and retires after 100 wrong tries. Nothing can show a token
   again; only a new one can be made. "Request a code" and "reset" answer the same for an unknown
   email (no enumeration). Each sign-in issues a new row id and never upgrades a claimed row in
   place (session fixation). A reset link changes nothing until the new password is set, so a
   request for someone else's address locks no one out. Setting or resetting a password revokes the
   person's other rows.
7. **Roles:** `siteAdmin` on the guest. The actor is admin only through a verified session of a site
   admin. The role protects the name, and a site admin cannot remove the protection. Changes an
   admin makes record which admin. The `organizer` participation role waits for a later plan; what
   an organizer may do per event is a product question of its own.
8. **Admin bootstrap.** `ADMIN_PASSWORD` and the admin cookie go; the admin UI is always on. While
   no site admin exists, the server logs a single-use bootstrap link at start (hashed, 24 h; a new
   start replaces it), and a script prints a new one for recovery. The bootstrap page signs the
   visitor in as a chosen or new guest, asks for a username and a password, and grants the role. A
   set `ADMIN_PASSWORD` only logs a deprecation warning. The admin users screen grants and revokes
   the role, never for the last one.
9. **Join links** are personal: one per guest per event, with no expiry. A link signs its person in
   (verified) and joins the event while that person has set no password since the link was made.
   After that it asks for a sign-in as that person, then joins the event. An admin makes a new link
   for one person (to copy into a messenger) or mails new links to all or selected participants with
   an email; a new link ends the person's previous one for that event, and the person is emailed
   that a new link exists, so a scam to get someone's link is noticed. A new link is also the
   recovery when a person without email forgets the password. `/join/{token}` in the SPA exchanges
   the token, replaces the history entry and opens the event. A QR sheet waits.
10. **Acting: identity mode** is a column on events, `open` (picking a name is enough) or
    `verified`. Existing events migrate to `open` (behaviour unchanged); new events default to
    `verified` (product decision, 08). A person is protected if they chose it, are a site admin, or
    take part in any `verified` event, so the strictest event wins. A domain function
    `assuranceRequired` (mode, protection) is the one copy; every acting use case checks it and the
    SPA predicts it.
11. **Reading** is a second, separate setting, decided here and built in the next plan: `public`,
    `link` (a secret event link that sets a cookie and redirects to the plain URL; rotatable;
    `Referrer-Policy: no-referrer`; the event is hidden from the root list) or `participants`
    (default). A kiosk gets a read-only device link that is no person. Until then `SITE_PASSWORD`
    stays an optional gate: its screen moves to the SPA and the gate to Hono, and it goes with the
    read setting (D2).
12. **Retiring Next (not identity) goes through Hono first:** the proxy, media and SPA serving move
    into the Hono app while Next still runs it from one catch-all route; then a Node entry replaces
    Next. `/api/health` stays as an alias of `/api/v1/health`, because monitors and the Docker
    healthcheck call it.

## Consequences

- The admin password and the admin cookie go; one identity model serves guests and admins.
- A stolen cookie value is useless without its row, and a person can sign out other devices.
- The upgrade signs everyone out once.
- An attendee can use one personal link for the whole event and never set a password; one who sets a
  password ends the link.
- Mailing or copying links makes new ones, which ends links sent before.
- Existing events keep their behaviour; a fresh event asks for verification.
- Until the read setting exists, anyone who passes the site password (or reaches a deployment
  without one) reads the schedule and the people directory.

## Alternatives

- **Rename `guests` to `people`.** Cleaner words, a large migration for no behaviour.
- **Signed cookies carrying the identity** (today). No revocation, and assurance cannot be raised
  without a new value.
- **Honour old cookies for a week.** Keeps people signed in across the upgrade, for a second reader
  and a week of unrevocable sessions.
- **argon2id now.** Needs a native module or WASM; scrypt from `node:crypto` is adequate.
- **Single-use join links that force a password.** Barely safer than a link that ends with the first
  password, and phone-typed passwords at an event are poor UX; passkeys are the strong option later.
- **Store join links readable, so an admin can copy one again.** A database leak would then expose
  every link.
- **Email as the only identifier.** Excludes deployments and people without email.
- **One mode setting with four levels** (public, secret URL, personal link, strict). Mixes who may
  read with who may act; two settings are simpler.
- **Per-event organizer role in this plan.** Its rights are undecided; it would freeze guesses.
