---
title: "Configuration"
description: "Every environment variable SchellingBoard reads, and how to enable email."
type: reference
---

# Configuration

SchellingBoard is configured entirely through environment variables. Only `AUTH_SECRET` is required;
everything else has a sensible default or switches a feature off when unset.

## Environment variables

| Variable                        | Required | Description                                                                                                                                                                                       |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_PASSWORD`                 | No       | Password gate for the whole site (leave unset to disable)                                                                                                                                         |
| `AUTH_SECRET`                   | Yes      | Signs the site login cookie and name-protection links. Random, min 32 chars. Changing it logs out the site gate, not attendees                                                                    |
| `DATABASE_URL`                  | No       | SQLite path (default: `file:/data/data.db`)                                                                                                                                                       |
| `SB_UPLOADS_DIR`                | No       | Dir for admin-uploaded files (default: `./uploads`, `/data/uploads` in Docker)                                                                                                                    |
| `SB_TRUSTED_PROXIES`            | No       | How many reverse proxies stand in front of the app, e.g. `1` (default: `0`). See [Behind a reverse proxy](#behind-a-reverse-proxy)                                                                |
| `SB_BOOTSTRAP_LINK`             | No       | Set to `1` for one start to log a link that makes its visitor a site admin, even when admins exist.                                                                                               |
| `SB_API_RATE_BURST`             | No       | How many API requests one address (or one open-name attendee behind it) may make in a burst, refilled at 5 per second (default: `1000`). Raise it if many attendees share one venue Wi-Fi address |
| `SB_UPDATE_CHECK`               | No       | Set to `false` (or `0`, `no`, `off`) to stop the daily look-up of the latest release on GitHub that powers the admin's [update notice](deployment.md#updating) (default: on)                      |
| `HOST_PORT`                     | No       | Host port to bind (default: `3000`, compose only)                                                                                                                                                 |
| `SCHELLINGBOARD_VERSION`        | No       | Image tag to run, e.g. a release tag (default: `latest`, compose only)                                                                                                                            |
| `SMTP_FROM`                     | No       | Sender address for outgoing email                                                                                                                                                                 |
| `SMTP_URL`                      | No       | SMTP connection URL (see below)                                                                                                                                                                   |
| `SMTP_HOST`                     | No       | SMTP server hostname (see below)                                                                                                                                                                  |
| `SMTP_PORT`                     | No       | SMTP server port                                                                                                                                                                                  |
| `SMTP_USER`                     | No       | SMTP username                                                                                                                                                                                     |
| `SMTP_PASSWORD`                 | No       | SMTP password                                                                                                                                                                                     |
| `SMTP_SECURE`                   | No       | `true`, `false`, or `requireTLS` (default)                                                                                                                                                        |
| `SITE_URL`                      | No\*     | Public base URL of the site, e.g. `https://sessions.example.org`                                                                                                                                  |
| `SB_ENABLE_DEV_TOOLS`           | No       | Set to `1` to enable the dev fake clock on a staging/demo instance. Leave unset in production                                                                                                     |
| `REMINDER_DISPATCH_INTERVAL_MS` | No       | How often to deliver due attendee-count reminders, in milliseconds (default: `60000`). `0` turns them off entirely — nothing else does, email or no email                                         |
| `API_DOCS`                      | No       | Set to `false` (or `0`, `no`, `off`) to stop serving the [API reference](api.md#the-openapi-description) and the OpenAPI document (default: served)                                               |

## Behind a reverse proxy

SchellingBoard limits failed logins per visitor, and tells visitors apart by their address. Behind a
reverse proxy, every request comes from the proxy, so set `SB_TRUSTED_PROXIES` to the number of
proxies in front of the app (usually `1`). The app then reads the visitor's address from the
`X-Forwarded-For` header, which each proxy must append to (Caddy and Traefik do by default; in nginx
use `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`).

Behind a proxy that ends TLS, the proxy must also send `X-Forwarded-Proto` (Caddy and Traefik do by
default; in nginx use `proxy_set_header X-Forwarded-Proto $scheme`). Without it, sign-in is refused.

Leave it at `0` when nothing stands in front of the app: a visitor could then fake the header to
dodge the limit. Without it, all visitors share one limit, so a few people mistyping the site
password can lock everyone out for some minutes.

### Live updates through a proxy

The live schedule is a stream the browser keeps open, and the app sends a small message on it every
25 seconds. A proxy must pass it on as it arrives and not hold it back:

- Turn off response buffering for `/api/v1/events/` (nginx: `proxy_buffering off`; the app already
  sends `X-Accel-Buffering: no`, which nginx honours unless you override it).
- Allow a read timeout above 25 seconds (nginx: `proxy_read_timeout 60s`). The app ends each stream
  after 10 minutes and the browser reconnects by itself.
- Use HTTP/2 or HTTP/3 to the browser if you can. Over HTTP/1.1 a browser opens at most six
  connections to one site, and each open tab with the schedule uses one.

When the stream cannot get through, the schedule shows **Reconnecting…** and then **Not updating:
may be out of date**; the pages still work and show the state at the last load.

## Email

Email is optional — leave the SMTP variables unset to disable it. To enable email, set `SMTP_FROM`
plus either `SMTP_URL` (a single connection string, e.g. `smtp://user:pass@localhost:1025`, which
already includes the host, port, user, password, and security settings) **or** `SMTP_HOST` together
with `SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_SECURE` — not both.

\* `SITE_URL` is required when email is enabled, so that emails can link back to the site.

Notification emails go out a few seconds after whatever they announce, not as part of it, so a slow
mail server never slows the site down. One that fails is retried for up to a day.

Leaving email unconfigured also disables
[attendee name protection](../organizers/how-it-works.md#attendee-identity), since it relies on
emailed login codes. It does **not** disable in-app notifications, including the reminders to record
attendance: those are delivered whether or not the instance can send mail. For which messages
SchellingBoard sends and when, see [How it works § Email](../organizers/how-it-works.md#email).
