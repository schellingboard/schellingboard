# ADR 0024: Sign-in through a proxy

- **Status:** Accepted
- **Date:** 2026-11-24
- **Amends:** [ADR 0017](0017-identity-and-roles.md) points 2 and 7 (an actor without a login
  session row, admin rights)

## Context

Some deployments sit behind an SSO proxy that has already signed the person in (oauth2-proxy,
Authelia, Authentik, Traefik ForwardAuth, nginx `auth_request`, Tailscale Serve). The proxy sends
the person's email in a request header, for example `X-Forwarded-Email`. Picking a name or entering
a code again is extra work for these people, and in an `open` event it lets anyone act as anyone.
Grafana, Gitea, Nextcloud and Paperless-ngx support this pattern ("trusted header" or "auth proxy").

The header is only as safe as the network. When a client can reach the app without going through the
proxy, it can send the header itself and become any person.

## Decision

1. **Admin settings, not environment variables.** A "Sign-in through a proxy" card in the site
   settings holds every option below. It is off by default. The settings live in the database, like
   the other site settings.
2. **The header names an email.** The admin gives the header name. The app refuses names that carry
   something else: `Cookie`, `Authorization`, `Host`, `Forwarded`, `X-Forwarded-For`, and
   `X-SchellingBoard-Proxy-Secret`. The value is matched case-insensitively against the private
   system email (`guests.email`), never against a contact entry the person types into the profile.
   Only an admin, an import or the bootstrap sets the system email, never the person. None of them
   checks the address, so the match trusts the admin and the proxy: the proxy must send only emails
   that its identity provider has verified.
3. **Trust checks are optional.** The admin can set a shared secret, a list of proxy addresses (IP
   or CIDR, compared with the socket address, never with `X-Forwarded-For`), both or neither. The
   app generates the secret and stores only its sha256 hash; the proxy sends it in
   `X-SchellingBoard-Proxy-Secret`. While neither is set, the card shows a clear, permanent warning:
   a client that reaches the app without the proxy can become anyone, so set a secret or an address
   list. An admin who knows that the network allows no other path can leave both empty. The card
   also shows what the admin's own current request carried (header seen, trusted or not), so a wrong
   setup is visible at once.
4. **The header wins, on each request.** A trusted request with a known email acts as that person: a
   `verified` actor with `via: "proxy"`, made from the header alone. No login session row and no
   cookie are made. Thus there is nothing to copy, and a sign-out at the proxy or an email change
   takes effect on the next request. On a trusted request, a login session of another person ends; a
   password or code session of the same person stays, so a site admin can still administer (point
   8).
5. **Same-origin requests only.** The proxy's own credential can be ambient: Tailscale Serve, basic
   auth, client certificates or a `SameSite=None` cookie reach the proxy from any site. So the
   header signs a person in only on a request that passes the same-origin check of the admin API
   (`Origin`, `Sec-Fetch-Site`). Otherwise a cross-site form could act as the person.
6. **A request without the header** uses the normal sign-in. The setting does not lock anyone out.
7. **Fixed identity in the UI.** While a request carries a trusted header, the web app shows the
   person's name but no name picker and no "switch user". "Sign out" goes to the logout URL from the
   settings, or is hidden without one. The password and login-code settings are hidden, except for a
   site admin.
8. **Site admins are excluded by default.** An option lets a `proxy` actor carry the site-admin
   role. Without it, a site admin behind the proxy is signed in as a normal person and signs in with
   a password to administer.
9. **Unknown email.** By default, the request continues without identity, and the app shows a notice
   that this site has no person with that email. An option creates the person. The name comes from
   an optional name header (Authelia's `Remote-Name`, oauth2-proxy's
   `X-Forwarded-Preferred-Username`; same refused names as point 2), else from the part of the email
   before `@`. On the first visit a dialog "Your name" shows that value and only a Save button; it
   cannot be dismissed, so no part of an email stays visible as a name. Creating a person and adding
   them to events is one server function, which the sign-up link also uses, so both flows stay
   alike.
10. **Events to join.** Each event has a switch "People who sign in through the proxy join this
    event", off by default. At a person's first `proxy` request after the server starts or after a
    switch changes, the person joins every such event they are not a member of, both new and
    existing people. The server remembers this in memory, so later requests cost no query.
11. **The site password gate** (where `SITE_PASSWORD` is still set) is passed by a trusted proxy
    sign-in.

## Consequences

- One generic feature serves every proxy that sends an email header. Proxies that sign a JWT
  (Cloudflare Access, Google IAP, Pomerium) work as plain header proxies; checking the JWT can come
  later as an extra trust check.
- A wrong setup without trust checks gives anyone any identity, site admin only if the admin allowed
  it. Docker's `ports:` opens a port past ufw, so this happens easily. The card's request check
  cannot see such a path, as it sees only the admin's own request through the proxy; the warning is
  the only protection.
- The proxy must remove the client's own copy of the header on every path, also on paths it does not
  protect (health checks, static files). The self-hosting docs say so for each example proxy.
- An identity provider that lets users set an unverified email (self-registration without
  confirmation, some social logins) lets anyone take over the person with that email, and a site
  admin if point 8 allows it. The docs show the verified-email setting of each example proxy.
- The socket address is the proxy only when nothing translates addresses in between. Docker's
  userland proxy and some NAT setups show every client with the same gateway address; an address
  list that holds it trusts everyone. The docs say so, and recommend the secret.
- With person creation and event joining on, everyone the proxy lets in becomes a member of those
  events. The proxy's access rules are then the events' membership rules.
- An admin who removes a person from an auto-join event sees them return after the next server start
  or switch change. To keep someone out, remove them at the proxy or turn the event's switch off.
- Turning the setting off takes effect on the next request.
- The person's list of login sessions does not show proxy browsers; the proxy has its own.
- With person creation on, a person an admin deletes is made again at their next visit. To keep
  someone out, remove them at the proxy's identity provider.

## Alternatives

- **Native OIDC.** No trust in the network, but discovery, callback, PKCE, client secrets and
  account linking are much more work, and the proxies above already do it. Can come later if needed.
- **Environment variables** (Grafana's model). Against the move to admin settings, and an admin
  cannot see the effect without a restart.
- **Trust checks required.** Safer by default, but the admin of an SSO proxy usually controls the
  network, and the warning makes the risk visible.
- **A login session row per proxy browser, valid only with the header.** Repeats the header, races
  when the first requests run in parallel, and makes a row per request for clients without cookies.
- **Header read once, then a normal 30-day session.** Simpler, but a sign-out or a removal at the
  proxy would not reach the app for 30 days.
- **Match profile contact emails.** Anyone can type any email there.
