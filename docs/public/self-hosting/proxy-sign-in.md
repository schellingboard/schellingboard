---
title: "Sign-in through a proxy"
description: "Let oauth2-proxy, Authelia or another SSO proxy sign attendees in by their email."
type: guide
---

# Sign-in through a proxy

If an SSO proxy already signs people in before they reach SchellingBoard, the app can trust the
email the proxy sends. A person then acts as themselves without picking a name or entering a code.

A site admin turns it on under **Admin → Settings → Sign-in through a proxy** (see the
[admin guide](../organizers/admin-guide.md#sign-in-through-a-proxy)). It is off by default, and a
request without the header signs in the normal way.

## How it works

- The proxy sends the person's email in a request header, `X-Forwarded-Email` by default.
- The app matches it, ignoring case, with the **system email** of a guest. A contact email typed
  into a profile never counts. An unknown email is handled as
  [below](#people-the-site-does-not-know).
- The header counts only on a request from the app's own pages, never on a cross-site request.
- A signed-in person sees their name, with no name picker, and the password and login-code settings
  are hidden (site admins keep them). **Log out** leads to the **Sign out address**, and is hidden
  when that is empty.
- Nothing is stored in the browser, so signing out at the proxy takes effect on the next request.

## People the site does not know

By default, a person whose email matches no guest is not signed in. They see a notice that the site
has no person with that email, and an organizer can add them.

Tick **Create people the site does not know** to make them at their first visit instead. The name is
the value of the **Header with the name** (for example `Remote-Name` for Authelia, or
`X-Forwarded-Preferred-Username` for oauth2-proxy), else the part of the email before the `@`. On
the first visit a **Your name** window shows it, and the person must press **Save** (changing the
name if they like) before going on. Everyone the proxy lets in then becomes a guest, so the proxy's
own access rules decide who may join.

## Events the proxy people join

A person is in no event until they join one, and sees no name menu (profile, log out) until then. In
an event's settings, tick **People who sign in through the proxy join this event**. Everyone the
proxy signs in, new or existing, then becomes a member at their next request. A member an organizer
removes returns after the switch changes or the server restarts.

The proxy must also remove any name header the client sends. The name is read as UTF-8.

## The header is only as safe as the network

If a client can reach the app without going through the proxy, it can send the header itself and
become any guest. Three rules keep that out:

1. **The proxy must remove the client's own copy of the header on every path**, also on paths it
   does not protect: health checks, static files, API paths. Overwrite the header, never append.
2. **The proxy must send only emails its identity provider has verified.** If users can register
   with an unconfirmed email, anyone can take over the guest with that email.
3. **The app port must not be public.** Bind it to the proxy's network only.

On top of that, set a **secret**, **proxy addresses**, or both. The card warns until you do.

:::warning "Docker publishes ports past the firewall"

`ports: "3000:3000"` in Docker opens the port even where `ufw` blocks it. Publish the app only to
`127.0.0.1` (`"127.0.0.1:3000:3000"`) or leave out `ports:` and let the proxy reach it over a shared
Docker network.

:::

:::warning "The gateway-address trap"

Proxy addresses are compared with the connection's source address. With Docker's userland proxy and
some NAT setups, every client appears with the same gateway address (for example `172.17.0.1`).
Listing that address then trusts everyone. If you see it, use the secret instead.

:::

### The secret

**Make secret** shows a value once. Have the proxy send it in the `X-SchellingBoard-Proxy-Secret`
header on every request to the app; requests without it are not signed in. With both a secret and
addresses set, a request needs both.

## oauth2-proxy

Run oauth2-proxy with the app as its upstream. It sends `X-Forwarded-Email` itself:

```ini
upstreams = ["http://schellingboard:3000"]
email_domains = ["example.org"]
pass_user_headers = true
# The default: refuse emails the identity provider has not verified
insecure_oidc_allow_unverified_email = false
```

Settings in SchellingBoard:

- **Header with the email**: `X-Forwarded-Email`
- **Proxy addresses**: the address oauth2-proxy connects from. The secret needs a fixed header:
  oauth2-proxy sets one only through `injectRequestHeaders` in its alpha config file, where the
  value must be base64-encoded. Otherwise put a reverse proxy between the two.
- **Sign out address**: `https://auth.example.org/oauth2/sign_out`

oauth2-proxy replaces `X-Forwarded-Email` on every request it forwards. Leave no route to the app
that bypasses it. It also removes the client's own copy of the header by default; keep the paths it
skips (`skip_auth_routes`) away from the app, or check that a request with a forged header to such a
path is not trusted.

## Authelia

Behind a reverse proxy that uses Authelia for forward auth (Traefik, nginx `auth_request`, Caddy),
Authelia returns `Remote-Email` and the reverse proxy copies it to the app:

```yaml
# Traefik forward-auth middleware
authResponseHeaders:
  - Remote-Email
```

Settings in SchellingBoard:

- **Header with the email**: `Remote-Email`
- **Sign out address**: `https://auth.example.org/logout`

Authelia's `file` and LDAP users have the email set by an admin, which counts as verified. In LDAP,
do not let users change their own email. In nginx, set the header from the auth response, in every
`location` that reaches the app, so a client's own copy is overwritten:

```nginx
auth_request_set $email $upstream_http_remote_email;
proxy_set_header Remote-Email $email;
proxy_set_header X-SchellingBoard-Proxy-Secret "…";  # if you use the secret
```

In Traefik, every router that reaches the app must use the forward-auth middleware. For Caddy, use
`forward_auth` on every route to the app with `copy_headers Remote-Email`.

## Check the setup

Open **Admin → Settings** through the proxy. Under the card, a line says whether your own request
carried the header and whether it was trusted. Then, from another machine that is not behind the
proxy, send a forged header straight to the app's port:

```bash
curl -i -H 'X-Forwarded-Email: <a guest email>' http://your-host:3000/api/v1/me/identity
```

The connection must fail, or the answer must show no sign-in as that guest.
