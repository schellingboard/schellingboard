---
title: "HTTP API"
description: "Script SchellingBoard over HTTP: the /api/v1 endpoints, signing in, errors, safe retries and the typed client."
type: reference
---

# HTTP API

Most of what the site and the `/admin` pages do is also available as JSON over
HTTP, under `/api/v1`. Use it to script event setup — events, days, locations,
guests, sessions — or to connect another tool to sessions, proposals, RSVPs and
votes. The `v1` in the path is the API's version.

## The OpenAPI description

Every endpoint, with its parameters, request bodies and responses, is described
in an OpenAPI 3.1 document, `packages/contracts/openapi.json` in the
repository. The site does not serve it: take the file from the tag of the
release you run,
`https://github.com/schellingboard/schellingboard/blob/vX.Y.Z/packages/contracts/openapi.json`,
and open it in any OpenAPI viewer (Swagger UI, Redoc) or client generator.

Endpoints under `/api/v1/admin/` are for organizers; the rest are what
attendees do in the app.

## Signing in

A request carries the same cookies the site sets in a browser: the site
password's, the admin login's, and the one choosing your name. There are no
API tokens yet; they are planned.

- **Site password.** When `SITE_PASSWORD` is set, every `/api/v1` endpoint
  outside `/api/v1/admin/` needs the site cookie.
- **Admin password.** `/api/v1/admin/` needs the admin cookie, and only that:
  the site password is not asked for there, as in the admin UI. With
  `ADMIN_PASSWORD` unset, these endpoints answer `404`.

Scripts should use `/api/v1/admin/` with the admin cookie, which they get by
exchanging the admin password at `/api/auth/login`:

```bash
SITE=https://sessions.example.org

curl -c cookies.txt -H 'content-type: application/json' \
  -d '{"password": "your admin password", "scope": "admin"}' \
  "$SITE/api/auth/login"

curl -b cookies.txt "$SITE/api/v1/admin/events"
```

Endpoints that act as an attendee — RSVPs, votes, your own profile and
notifications — act as the name chosen in the browser, and are meant for the
site itself until API tokens arrive. The cookies are only sent over HTTPS in
production.

Admin endpoints refuse a request that a browser sends from another website;
scripts, which send no `Origin` header, are not affected.

## Errors

A refused request answers with a problem details body (RFC 9457,
`application/problem+json`):

```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "code": "session.full",
  "detail": "This session is full"
}
```

Branch on `code`. Once released, a code keeps its meaning; `title` and
`detail` are English text for people and may change. A request that does not
match the endpoint's description gets `400` with `request.invalid` and an
`errors` list naming each field and what is wrong with it; a few endpoints
attach the same list to their own codes, such as `guest.invalid`.

| Status | Means                                                           |
| ------ | --------------------------------------------------------------- |
| `400`  | The request is invalid (`request.invalid`, or a field's code)   |
| `401`  | Not signed in (`site.unauthenticated`, `admin.unauthenticated`) |
| `403`  | Not allowed (`admin.required`, `guest.protected`, …)            |
| `404`  | Not found, or admin access is disabled (`admin.disabled`)       |
| `409`  | Conflicts with the current state (`session.full`, …)            |
| `422`  | An `Idempotency-Key` reused for a different request             |
| `500`  | An unexpected error on the server (`server.error`)              |
| `503`  | A service the site relies on failed, such as the mail server    |

## Retrying safely: `Idempotency-Key`

A request that changes something (`POST`, `PUT`, `PATCH`, `DELETE`) may carry
an `Idempotency-Key` header. Send a new random value, such as a UUID, for each
change you mean to make, and the same value again when you retry it — after a
timeout or a dropped connection, for example. The change is then made once.

- A retry after the first request finished gets the first response again,
  without repeating the change.
- A retry while the first is still running gets `409` with
  `idempotency.inProgress`; wait and retry. If the first never finishes, for
  instance because the server restarted, a retry after a minute runs it again.
- The same key with a different method, path or body gets `422` with
  `idempotency.keyReused`.
- An answer of `500` or above is not kept, so a retry runs the request again.

Keys are kept for 24 hours and are separate for each signed-in user, so two
scripts cannot collide on a key. A key must be 1 to 255 characters. A request
with neither the admin cookie nor a selected attendee has its key ignored.

For uploads (a profile photo, the venue map), a retry must resend exactly the
same bytes; most HTTP libraries pick a new multipart boundary per attempt, which
counts as a different body.

## Caching

Every response is sent with `cache-control: no-store`: browsers and proxies
never keep it, so a read always shows the current state.

## The TypeScript client

The repository holds a typed client, `@schellingboard/api-client` in
`packages/api-client`: types generated from `openapi.json` and a small wrapper
around [openapi-fetch](https://openapi-ts.dev/openapi-fetch/). It is not
published to npm; use it from a checkout of the release you run, or generate a
client in any language from `openapi.json`.

```ts
import { createApiClient } from "@schellingboard/api-client";

const api = createApiClient({
  baseUrl: "https://sessions.example.org",
  headers: { cookie: adminCookie },
});
const { data, error } = await api.GET("/api/v1/admin/events");
if (error) console.error(error.code);
```
