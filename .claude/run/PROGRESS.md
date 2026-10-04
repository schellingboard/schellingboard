# Run progress

Next step: 3.

## Decisions

- Step 1: `@hono/zod-openapi` supports zod 4 (checked with `npm view` on 2026-10-04):
  1.6.3 peers on `zod ^4.0.0` and `hono >=4.10.0`, built on
  `@asteasolutions/zod-to-openapi` 9.1.0 (peer `zod ^4.0.0`). Repo zod is 4.6.5,
  hono 4.13.13. Contracts stay plain `zod`; no Hono dependency in `packages/contracts`.
- Step 1 (ADR 0012, Proposed): code under top-level `server/{kernel,http,composition.ts,
modules/<m>/{module.ts,ports.ts,application,http}}`; ports are Picks of the `db/`
  container's repositories (they stay in `db/`). Actor resolved from today's cookies
  (admin cookie, guest cookie + level) by one kernel function shared with server actions.
  Problem details: `type: about:blank`, `code` extension, contract failures `400
request.invalid` with `errors`. Idempotency: `idempotency_keys` keyed by actor + key,
  stores method/path/body hash/response; in-flight `409 idempotency.inProgress`, mismatch
  `422 idempotency.keyReused`, 5xx not stored, pruned after 24 h by the jobs loop;
  `command_key` on the change log deferred to step 4. `openapi.json` committed at
  `packages/contracts/openapi.json`; `make openapi` / `make openapi-check` (in precommit).
  Admin endpoints live under `/api/v1/admin/`, gated in `proxy.ts` like `/api/admin/*`
  (admin cookie only, no site password, cross-site check, 404 when disabled); the rest
  of `/api/v1` needs the site password. Proxy refusals there are problem details.
- Step 2: `server/kernel/result.ts` (`ok`, and `notFound`/`forbidden`/`conflict`/
  `invalid`/`gone(code, detail?)` returning a `Failure`), `server/kernel/actor.ts`
  (`resolveActor(cookies)` -> `{ admin, guest: { id, level } | null }`, cookie facts
  only). `server/http/`: `create-app.ts` (`createApp(basePath)`: OpenAPIHono with
  `request.invalid` hook, `route.notFound` 404, `server.error` 500; handlers must be set
  after `basePath`, which drops them), `problem.ts` (`problemResponse`,
  `problemFromError`, always `no-store`), `actor.ts` (middleware, `c.var.actor`),
  `app.ts` (`api`), `openapi.ts`, `health.ts`. Contract `@schellingboard/contracts/health`.
  `make openapi` / `openapi-check` run `scripts/openapi.ts` (prettier-formatted output);
  check is in precommit and the CI lint job.
- Step 2: proxy codes: `site.unauthenticated` 401; `/api/v1/admin/*` via
  `adminApiRefusal` (shared with `requireAdminAuthApi`): `admin.disabled` 404,
  `request.crossSite` 403, `admin.unauthenticated` 401. `/api/v1/health` needs the site
  password (legacy `/api/health` stays public).
- Step 2: depcruise rules added; `app/` may also import `server/kernel/` (server actions
  resolve the actor there); ADR 0012 section 2 says so (amended in step 2's review).
  `use-cases-take-only-container-types` is the one rule using `type-only`; noted in
  `docs/dev/architecture-rules.md`.
- Step 2: the mount exports `OPTIONS` to Hono on purpose, so `OPTIONS` gets the
  `route.notFound` 404, not Next's automatic `Allow` reply. A Hono-only server answers
  the same once Next leaves (step 7). No CORS: the SPA is same-origin and token clients
  are not browsers (`05-security.md`). Settled in review; do not re-raise.
- Step 2 left for step 4: the kernel "may act as guest" function (#370 rule) and
  `server/composition.ts` arrive with the first use case; `v1/[[...route]]` is in the
  mutating-surface guard's `READ_ONLY` and must move to a verifier with the first
  mutation.

## Questions

None open.

## Log

- Step 1: ADR 0012 written (Proposed). `make precommit`: format, lint, arch, typecheck,
  test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked by network policy);
  the suite is run on the preinstalled Chromium via an untracked local config instead.
  Docs-only step.
- Step 2: kernel, problem details, actor middleware, `GET /api/v1/health`, committed
  `packages/contracts/openapi.json` with `make openapi-check`, dependency-cruiser rules.
  format, lint, arch, openapi-check, typecheck, test-coverage pass. Firefox E2E cannot
  run (Playwright CDN blocked by network policy); the suite was run on the preinstalled
  Chromium: no failures beyond the known Chromium baseline except timing flakes outside
  it (`profile-comments.spec.ts:95`, `schedule-agenda.spec.ts:220`,
  `view-session.spec.ts:7` and `:45`, an admin locations test) that pass on rerun or
  `--repeat-each`, and `view-session.spec.ts:7` flakes on unchanged HEAD too.
- Step 2 review: the Chromium failures outside the baseline are not caused by step 2.
  Same five tests, `--repeat-each 5 --retries 0`, failures out of 5 on HEAD vs parent
  (36cdd84): `admin.spec.ts:1033` 5 vs 5 (baseline), `profile-comments.spec.ts:95` 2 vs
  5, `schedule-agenda.spec.ts:220` 4 vs 4, `view-session.spec.ts:7` + `:45` 5 vs 6 of 10. 16 vs 20 failed in all: they fail at least as often without the commit, which no
  test reaches (`/api/v1` only), so they are environmental timing failures.
- Step 2a: `utils/auth-cookies.ts` holds the Next-free cookie names, signing and
  checks (`readGuestCookie`, `isAdminCookieValid`, ...); `utils/auth.ts` re-exports them,
  callers unchanged. Rule renamed `kernel-reaches-no-module`, now `reachable: true`; it
  failed on the old layout (`actor.ts` -> `utils/auth.ts` -> `next/server`).
  format, lint, arch, openapi-check, typecheck, test-coverage pass. Firefox E2E cannot
  run (Playwright CDN blocked); on Chromium `user-auth`, `admin`, `update-session` pass
  except the two baseline `admin.spec.ts` failures (`:828`, `:1033`).
