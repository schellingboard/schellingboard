# The web app (`apps/web`)

`apps/web` is the single-page app that replaced the Next pages
([ADR 0015](adr/0015-spa-alongside-next.md)). It is a workspace package built with Vite, React and
TanStack Router, styled with Tailwind and the colour tokens in `styles/tokens.css`.
[Architecture](architecture/README.md) has the whole picture.

## How it reaches the browser

- Every root path that is not `/api`, `/media`, `/locations`, `/sw.js`, an icon or the manifest is a
  page of the SPA.
- `server/http/web.ts` applies the site password to those paths (not to `/admin/**`, which gets the
  shell: the admin API holds the gate, and the sign-in follows from it), then serves the shell: it
  reads `apps/web/dist/index.html` from disk on each request and answers `no-store`.
- Hashed files are requested as `/_spa/assets/…`, served without the password as immutable; a
  missing one is a 404, never the shell.
- The router owns `/` (`app/home-page.tsx`: the event list from `GET /api/v1/events` and
  `GET /api/v1/site`, or a redirect to the only event), `/{slug}` (an event's schedule),
  `/{slug}/proposals/**` (list, quick voting, new, edit; `?viewProposal=` opens the modal), the
  session forms, `/{slug}/meetings`, `/guests/**`, `/settings`, `/notifications`, `/auth/login`,
  `/auth/reset`, `/account-security`, `/login` (the site password, open to visitors without the
  cookie; `POST /api/v1/auth/site`) (`app/account-pages.tsx`) and `/admin/**`
  (`app/admin-pages.tsx`). Anything else is "Page not found".

- `public/sw.js` (registered by `main.tsx` outside the dev server) caches the shell and the
  `/_spa/assets/` files. SPA navigations go to the network first and fall back to the cached shell,
  so a new build shows as soon as it is reachable; `/api`, `/media` and the other server paths are
  never touched. A page compares the shell's build id with `/api/v1/health` (`app/reload-offer.tsx`:
  on load, every 5 minutes, on `online` and when the tab is shown). The viewer is remembered in
  `localStorage` so the saved schedule opens offline.

The files are read relative to the working directory, so the same code serves `make start`, and the
Docker image, which copies `apps/web/dist` next to `dist/server`.

## Build and run

- `make build` and the E2E web server run `vite build apps/web` and `scripts/build-server.ts` (one
  esbuild bundle, `dist/server/main.mjs`; the native addons stay external); the Dockerfile does the
  same. The server serves what is in `apps/web/dist`, so rebuild the SPA after changing it when
  testing through the server.
- `make dev` rebuilds the bundle on change, runs it on `PORT + 1` with `node --watch`, and runs Vite
  on `PORT` (default 3000). Open the Vite port: it serves the SPA with hot reload and proxies
  `/api`, `/media` and the other server paths to the Node server. The shell gate does not apply in
  dev.

## Layout and rules

`apps/web/src/` holds `app/` (layout, nav bar, shell, pages), `ui/` (dialog, button, tooltip, icons,
notices), `features/schedule/`, `replica/`, `commands/` and `queries/` (the replica: store, `apply`
from `packages/contracts/src/feed-apply.ts`, feed client, sync state, a server clock offset and
IndexedDB persistence keyed by event and viewer, opened as `stale`). dependency-cruiser enforces
that the package imports `packages/domain`, `packages/contracts` and `packages/api-client` only
(never `server/`, `utils/` or `db/`), that nothing imports it, that `features/` never imports
`api-client`, and that it declares what it imports. See [Architecture rules](architecture-rules.md).

## The viewer and the user picker

Who the browser acts as comes from `GET /api/v1/me/identity` (`ViewerProvider`, `app/viewer.tsx`):
`guestId` is `undefined` until the server answers, then a guest id or `null`. The replica and the
command runner are opened for that guest, never for one read from a persisted copy. `choose` and
`signOut` call `PUT`/`DELETE` on the same path. A protected name answers `guest.protected` and
`UserMenu` sends the user to the sign-in, `/auth/login?guest=<id>`; a successful login reloads `/`.
The picker lists the guests it is given: the event snapshot's `guests` (members and hosts) on an
event page, the attendee directory (`GET /attendees`, everyone) on `/guests`. Sign-out and a switch
between names clear the device's persisted replicas (`persistence.clear()`); a change of `guestId`
also closes the feed and reopens the replica, the command runner and the queries
(`useScheduleSession` does: the viewer is part of its effect key). The provider asks again every 5 s
while the first identity fetch fails. `commands/keys.ts` holds the `newKey` the runner needs.

## Theme, footer and dev clock

`app/theme.tsx` keeps the ADR 0005 `sb-theme` cookie (read at start, written with the `light`/`dark`
class on `<html>`; `index.html`'s inline script applies it before first paint). The footer's version
and build come from `GET /api/v1/health` (`useHealth`); for the admin, `GET /api/v1/updates`
(`useUpdateStatus`) adds a red dot and the latest release; its release notes are
`packages/domain`'s. The dev clock toolbar needs `devTools` from the same endpoint
(`SB_ENABLE_DEV_TOOLS`) and `?dev=1`; it writes the `time-override` cookie and calls `onChange`,
which the shell makes reload the app so the replica is read under the new time.

## Sync indicator, error boundary and the shell

`SyncIndicator` shows the replica's link state (`useSyncState`: live, reconnecting after a short
grace, stale) and re-renders at the instant it next changes. `ErrorBoundary` keeps the nav and
footer when one screen crashes (try again, reload, or go to the home page). `Shell`
(`app/shell.tsx`) composes theme, viewer, layout, nav, map button (`MapButton`, from `GET /site`),
user menu, footer, boundary and dev clock from props (events, the picker's guests, location).
`ShellProviders` (theme and viewer) and `ShellFrame` are also exported, for a screen that needs the
viewer before it can say what the frame shows. The schedule page mounts it.

## The sign-in screens

`src/features/sign-in/` holds `LoginScreen` (an emailed code link, or an email or username),
`ResetScreen` (the reset link) and `AccountSecurityScreen` (protection, username, signed-in
browsers). They take `signInCalls(api)` and, for the last, an `AccountSecurityState` from
`createAccountSecurityQuery`; forms wait for the answer (`useFormMutation` with `explainRefusals`,
since the server's wording "Wrong password" is the message). `app/account-pages.tsx` routes them:
the guest named by `?guest=` comes from the attendee directory, and a login reloads the app on `/`.

`features/sign-in/` also holds `JoinScreen` (`/join/$token`: a personal join link signs the person
in and opens the event) and `BootstrapScreen` (`/auth/bootstrap`: the site-admin bootstrap link).
The admin guests screen has the join-link actions (`features/admin/join-links.tsx`), and the event
form (`event-config.tsx`) has the Identity select.

## The schedule

`src/features/schedule/` holds the schedule screens; `ScheduleScreen` is the entry: a snapshot, the
server's `now`, `links`, the page's search params (+ a setter) and slots for the sync indicator and
footer. The view (`view=agenda`), filter chips (`filter=`) and narrowed rooms (`loc=`) live in the
params; the search text and unfolded days are local. Everything is drawn from the replica: sessions,
rooms and RSVPs from the snapshot, the viewer's own 1-on-1s from `snapshot.me.meetings`
(`meetingViewsFrom`). Clash lines rest on other guests' RSVPs, which the replica lacks:
`queries/meeting-clashes.ts` fetches them from `GET /meetings` (debounced, after any change in
`store.meetingsRevision()`) and `withClashes` merges them in. Times use the event's zone, never the
ambient one; the now line follows `store.serverNow()` (`useServerNow`).

The pure parts (`grid-layout`, `column`, `meeting-column`, `agenda`, `fold`, `filters`, `search`,
`meeting-rules`, `meeting-clash-text`) are the schedule's own; the legacy copies went with the Next
schedule. `model.ts` has the new pure rules (narrowing by room, matching, day folds). `links.ts` is
the one place that decides where a session, a 1-on-1, add-session or booking link goes: a session
and a 1-on-1 (`?viewMeeting=`, `?bookMeeting=`) open in the SPA's own modals over the schedule, the
add and edit session links go to the session form (`app/sessions-pages.tsx`, `/{slug}/add-session`,
`/{slug}/edit-session`). `/{slug}/meetings` (`app/meetings-page.tsx`) is where a meeting
notification lands: it hands the meeting to the schedule, or opens it read-only outside the
scheduling phase.

`app/schedule-page.tsx` composes it: `useScheduleSession` (`replica/session.ts`: `openReplica`,
`connectFeed`, `autosaveReplica`, hidden-tab and back/forward-cache handling, plus a command runner)
for the viewer from `useViewer()`, the events for the nav (`GET /api/v1/events`), the snapshot's
guests for the picker, the proposals redirect for an event not in its scheduling phase. A viewer
change closes the feed and opens the event again.

## Tests

Unit tests sit next to the code (`*.test.ts(x)`) and run in the `web` Vitest project under happy-dom
as part of `make test`. Components are tested with `@testing-library/react` and `user-event`
(cleanup is registered in `src/test-setup.ts`), through roles and names, never styling. Screens are
covered by the E2E suite; there is no browser component runner.

## Opening a modal and closing it

(anchor: MnpjIo7Y)

The session, proposal and 1-on-1 modals are `?viewSession=`, `?viewProposal=` and `?viewMeeting=` on
the page behind them. A click on a link inside the SPA pushes the address, so Back closes the modal
(`SpaLinks` arms this; `app/proposal-nav.ts` holds the flag). An address opened directly, or reached
from a notification or an email, has no entry of ours to pop, so closing it removes the parameter.
The flag must be taken when the modal closes and cleared when none is open, or a later modal
inherits "close by going back" (two E2E specs cover it). Links from legacy pages and emails are
plain anchors: build them with `links.ts` and `utils/notifications.ts`, never a second copy.

## Failure notices

`NoticeProvider` (`ui/notices.tsx`, mounted in `ShellProviders`) shows failures as `role="alert"`
and confirmations as `role="status"`, above any screen, so a notice outlives the control that raised
it. Every `Command` has a `describe` (what it does to what, naming the session by title, day, time
and room). The runner's `onFailure` gives that, the problem code, and whether the retries ran out;
`failureMessage` turns it into "Could not …" (refused, with the reason) or "might not have been
saved" (gave up). A notice can carry an action; the runner sets none, as a blind re-send would use a
new idempotency key.

## Forms

A form waits for the server, unlike a command. `useFormMutation` (`commands/`) calls `awaitMutation`
with an idempotency key kept only after an unreachable answer, so pressing Save again after "might
not have been saved" cannot apply it twice. Any other answer, a refusal included, ends the key,
because the server stores it and would refuse it with changed values. The result is one of: fields
(the problem's `errors` by path), a `409` ("changed by someone else"), a refusal with its reason, or
unreachable. `validateFields` runs a zod schema per field before sending. `ui/form.tsx` has the
controlled fields (`TextField`, `TextAreaField`, `SelectField`, `DateTimeField`, `CheckboxField`):
label, hint and error are tied to the input, and an error is a `role="alert"`.
