# The public demo

[demo.schellingboard.org](https://demo.schellingboard.org) runs the app with the large seed, open to
anyone, reset daily. It is a separate program and image that wraps the normal server; production
code does not know about it, and an architecture rule stops anything but `server/demo/` and `tests/`
from importing it.

## Design

- **Entry**: `server/demo/main.ts`, bundled to `dist/server/demo.mjs`. `server/main.ts` is
  unchanged. The `demo` Dockerfile target adds it and the seed avatars; it is never published to
  Docker Hub.
- **Seed**: the `large` profile from `scripts/seed/seed.ts`. No `SITE_PASSWORD`, no SMTP.
- **Marker**: the table `demo_marker` (created by demo code, not in the drizzle schema) records when
  and by which version the database was seeded. Boot seeds an empty database, wipes and reseeds one
  whose marker is older than the last scheduled reset or from another version, and refuses to start
  on data without a marker.
- **Gate**: `server/demo/gate.ts` is a Hono app in front of `web.fetch`. It answers
  `GET /demo/status`, adds `X-Robots-Tag: noindex`, and refuses credential changes and uploads with
  `site.featureDisabled` (the SPA shows "This is turned off on this site.").
- **Banner**: `server/demo/banner.ts`. The gate injects a warning bar into the SPA HTML: public
  demo, reset countdown, the shared credentials, a link to
  [what works on the demo](https://github.com/schellingboard/schellingboard/blob/main/docs/public/demo.md),
  the abuse contact. Closing shrinks it to one line (warning and countdown) and is remembered in
  `sessionStorage`, as most links load a new page; **Show info** expands it again. It sets the CSS
  variable `--top-inset` to its visible height; the app's fixed bars take their offset from it.

## Daily reset

The process exits at `SB_DEMO_RESET_AT` (default `03:00` UTC). Fly's restart policy is `always`
(`fly.toml`), so it comes back, deletes the database files and uploads, and reseeds. There is no
in-place wipe: in-memory feed, snapshot and rate-limit state would go stale.

## Keeping the deny list current

Credentials are denied for every account, because a visitor protecting a shared seeded name would
lock the others out. When you add an endpoint that sets a credential or accepts an upload, add it to
`DENIED_OPERATIONS` in `server/demo/gate.ts` (paths spelled as in the OpenAPI document, with the
`/api/v1` prefix). Bodies that only sometimes carry an upload (`PUT /api/v1/admin/settings` with a
map, `PUT /api/v1/admin/guests/{id}` with a `username`) have their own checks in the same file. The
admin user form sends `username` only when edited, so other edits pass. Update `docs/public/demo.md`
too: it lists the accounts and what is turned off.

## Testing and deployment

`make test-e2e-demo` builds the `demo` target, starts it and runs `tests/e2e-demo/`; it is not part
of `make prepush`. Deployment and the `demo` workflow job are in
[Releasing a new version](releasing.md); how the Fly app was created is in
[One-time Fly.io setup of the demo](demo-fly-setup.md).
