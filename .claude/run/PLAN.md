# Run plan: step 3, the API in the same process

Goal: [step 3](../../docs/dev/target-architecture/10-path-from-here.md) — a versioned
HTTP API under `/api/v1`, described by OpenAPI generated from `packages/contracts`.
Server actions and the existing `/api/*` routes call the same use cases, so both paths
share one implementation. No UI change. Issue: #677 (`issue #677` footer; `fixes #677`
on the step that commits `openapi.json`). Admin endpoints serve #1006.

Read first: `docs/dev/target-architecture/03-server.md` (Use cases, HTTP API),
`07-repo-and-rules.md`, ADRs 0010 and 0011.

## Settled before the run

- Hono with its zod OpenAPI integration, mounted by a Next catch-all route handler
  `app/api/v1/[[...route]]/route.ts`. No custom server; Dockerfile, standalone output
  and `next dev` stay as they are.
- `proxy.ts` (site password, admin gate) applies to `/api/v1` as to other routes.
- The actor comes from today's cookies (acting guest, admin). No tokens, persons or
  roles: that is step 6.
- Out of scope: login, password and admin-auth flows (step 6); the dev fake-clock
  actions; the change feed and snapshot (step 4); extending the change log to more
  aggregates; `expectedVersion` checks unless a table already has a version column.

## Steps

Each family step: use cases first (integration tests against them), then routes with
request and response contracts, then the server actions and legacy routes for that
family delegate to the use cases. Keep each legacy route's response shape.

- [ ] 1. **ADR 0012** (Status: Proposed): mount, where use cases and route modules
      live in the current repo (recommendation: `server/kernel`, `server/http`,
      `server/modules/<module>/{application,http}`, as in 03-server.md), actor
      resolution, `Result` and RFC 9457 problem details with stable codes,
      `Idempotency-Key` storage (24 h), committed `openapi.json` and its check. Verify
      the Hono zod OpenAPI package supports zod 4 before deciding; record the answer.
- [ ] 2. **Kernel and skeleton**: `Result`, problem-details mapping, actor middleware,
      the Hono app with one route (`GET /api/v1/health`), `openapi.json` generation and
      a `make` check that fails when it is stale (part of `make precommit`).
      dependency-cruiser rules for the new layout.
- [ ] 3. **Idempotency**: table, migration, middleware for mutations; a retried
      request returns the stored response. Cover #141 if it falls out.
- [ ] 4. **Sessions**: get, list, create, update, delete. Delegate `add-session`,
      `update-session`, `delete-session`, `session`, `admin-sessions`.
- [ ] 5. **RSVPs and votes**: `toggle-rsvp`, `rsvps`, `add-vote`, `delete-vote`,
      `votes`, `admin-rsvps`.
- [ ] 6. **Proposals and comments**: `proposal`, `admin-proposals`, comment actions.
- [ ] 7. **Meetings**: `meetings` route and actions, `admin-meetings`.
- [ ] 8. **People and own settings**: `profile`, `settings`, `notifications`, `push`,
      `attendee-count`.
- [ ] 9. **Admin: events, days, locations** (#1006): `admin-events`, `admin-days`,
      `admin-locations`, `admin-location-events`, `admin-location-unavailability`.
- [ ] 10. **Admin: guests and site settings**: `admin-guests`, `admin-guest-events`,
      `admin-guest-import`, `admin-settings`, `admin/*` routes.
- [ ] 11. **`packages/api-client`**: generated from `openapi.json` in the build; one
      integration test calls the API through it.
- [ ] 12. **Docs**: API page under `docs/public/self-hosting/`; a `docs/dev/` note;
      step 3 status in `10-path-from-here.md`; one CHANGELOG bullet; ADR 0012 text
      matches what was built.
- [ ] 13. **Finish**: summary in PROGRESS.md for review, then delete `.claude/run/`.
