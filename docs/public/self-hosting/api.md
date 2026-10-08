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
in an OpenAPI 3.1 document. The site serves the document of the version it
runs:

- **`/api/v1/docs`** is an interactive reference. Read the endpoints and send
  requests from the browser; they carry your login cookies, so they act as
  you.
- **`/api/v1/openapi.json`** is the document itself, for another OpenAPI
  viewer or a client generator.

Both need the same login as the rest of `/api/v1` (see below). To stop serving
them, set `API_DOCS=false` ([Configuration](configuration.md)). The document
is also in the repository, at `packages/contracts/openapi.json` in the tag of
each release.

Endpoints under `/api/v1/admin/` are for organizers; the rest are what
attendees do in the app.

## Signing in

A request carries the same cookies the site sets in a browser: the site
password's, the admin login's, and the one choosing your name. There are no
API tokens yet; they are planned.

- **Site password.** When `SITE_PASSWORD` is set, every `/api/v1` endpoint
  outside `/api/v1/admin/` needs the site cookie or the admin cookie.
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

## Caching

Every response is sent with `cache-control: no-store`: browsers and proxies
never keep it, so a read always shows the current state.

## Syncing from a script

A script that keeps an event in step with an outside plan, such as a list of
shifts, reads what is there first and then changes only what differs. With the
admin cookie it can read every endpoint it needs:

- **Check times before booking.** `GET /api/v1/admin/events/{id}` answers the
  event's settings and its days, so the script can check session times first.
- **Find a location before adding it.** `GET /api/v1/admin/locations` lists
  every location, hidden ones included. Location names need not be unique, so
  the script decides what counts as the same location, then creates the missing
  ones with `POST /api/v1/admin/locations`.
- **Find the existing sessions.** `GET /api/v1/sessions?eventId=…` lists every
  session of the event, with its rooms, hosts (id and name only) and capacity.
- **Update a session.** `PUT /api/v1/admin/sessions/{id}` replaces the
  session: send every field, taking the ones you do not change from the read. A
  field left out gets `400`, so nothing is reset by accident.
- **Warn before deleting.** Each session in the list has `numRsvps`; show it
  before `DELETE /api/v1/admin/sessions/{id}`.

Send an `Idempotency-Key` with each change, so retrying one after a dropped
connection does not create a second location or session.

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
