# ADR 0017: Identity and roles

- **Status:** Proposed (Q7 and Q8 below wait for the maintainer)
- **Date:** 2026-10-28

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
   a `verified` row. Expired rows are pruned by the jobs loop.
3. **Old cookies are honoured until they expire** (7 days at most): the `open.` and `verified.`
   values still read. They cannot be revoked in that time (05 deviation). Their reader is deleted in
   step 16 of this run's plan.
4. **Credentials:** password, emailed login code, reset link, join link. The password hash stays
   scrypt (`node:crypto`, no native module); [05](../target-architecture/05-security.md) says
   argon2id and is updated in step 13. The stored format (`scrypt$salt$key`) holds no cost
   parameters; it will carry N/r/p so cost can rise later. Passkeys and API tokens wait for a later
   plan.
5. **Sign-in API** under `/api/v1/auth/` (request a code, log in with code or password, reset, sign
   out) and `/api/v1/me/credentials`, `/api/v1/me/login-sessions`. Strict rate limits and Origin
   checks, as for the admin API. Problem codes name a wrong credential (a wrong, expired or spent
   password or code are one code, so a guess learns nothing) and too many attempts. **This amends
   ADR 0016 point 4** ("no API for passwords"): the API now exists, because the SPA's sign-in
   screens use it.
6. **Token rules.** Login-session ids, codes, reset tokens and join tokens are random and stored
   only as sha256 hashes: 32 random bytes for ids and reset or join tokens; the emailed code is 8
   characters (~40 bits, per-code salt) and retires after 100 wrong tries. Each expires. "Request a
   code" and "reset" answer the same for an unknown email (no enumeration). Each sign-in issues a
   new row id and never upgrades a claimed row in place (session fixation). Setting or resetting a
   password revokes the person's other rows.
7. **Roles:** `siteAdmin` on the guest. The `organizer` participation role waits for a later plan;
   what an organizer may do per event is a product question of its own. The actor is admin only
   through a verified session of a site admin.
8. **Join links** are per guest per event, single-use and expiring (05). The organizer gets them as
   a CSV from the admin guests screen; a QR sheet and bulk email wait. `/join/{token}` in the SPA
   exchanges the token, replaces the history entry and opens the event.
9. **Identity mode** is a column on events. Existing events migrate to `open` (behaviour unchanged);
   new events default to `verified` (product decision, 08). A domain function `assuranceRequired`
   (mode, raised by protection) is the one copy; every acting use case checks it and the SPA
   predicts it.
10. **Retiring Next (not identity) goes through Hono first:** the proxy, media and SPA serving move
    into the Hono app while Next still runs it from one catch-all route; then a Node entry replaces
    Next. `/api/health` stays as an alias of `/api/v1/health`, because monitors and the Docker
    healthcheck call it.

### Pending the maintainer

- **Q7, admin bootstrap.** Recommendation: `ADMIN_PASSWORD` goes. While no site admin exists, the
  server logs a single-use bootstrap link at start (hashed, 24 h); a script prints a new one for
  recovery; a new link at each restart invalidates the old one. Upgrade path: installs with
  `ADMIN_PASSWORD` have no site admin after the migration, so they use the logged link. A set
  `ADMIN_PASSWORD` only logs a deprecation warning. The admin UI is then always on. The bootstrap
  page signs the visitor in as a chosen or new guest, asks for a password and grants the role; the
  admin users screen grants and revokes it, never for the last one.
- **Q8, site password.** D2 says no shared site password, but nothing replaces it until reads need a
  participation. Recommendation: keep `SITE_PASSWORD` as an optional gate through the retirement of
  Next, with its screen in the SPA and the gate in Hono; decide its removal together with
  participation-gated reads.

Steps that depend on Q7 or Q8 do not start before the answer.

## Consequences

- The admin password and the admin cookie go (after Q7); one identity model serves guests and
  admins.
- A stolen cookie value is useless without its row, and a person can sign out other devices.
- Existing events keep their behaviour; a fresh event asks for verification.
- Legacy and new cookies coexist for a week.

## Alternatives

- **Rename `guests` to `people`.** Cleaner words, a large migration for no behaviour.
- **Signed cookies carrying the identity** (today). No revocation, and assurance cannot be raised
  without a new value.
- **argon2id now.** Needs a native module or WASM; scrypt from `node:crypto` is adequate.
- **Per-event organizer role in this plan.** Its rights are undecided; it would freeze guesses.
