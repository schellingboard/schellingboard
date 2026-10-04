# Screenshots

The screenshots in this directory are the only copies in the project. Two
sites use them:

- **[schellingboard.org](https://schellingboard.org)** — the hand-written
  landing page in `www/`, which references them as `screenshots/<name>.webp`.
  `scripts/build-www.sh` copies this directory next to the HTML.
- **[docs.schellingboard.org](https://docs.schellingboard.org)** —
  `scripts/build-docs.sh` copies this directory into each published version, so
  every release keeps the interface it shipped with. Reference them
  **relatively** from markdown (`../screenshots/<name>.webp`); a root-relative
  path would point every old version at the newest images.

Recapturing a screenshot therefore updates both sites at once, which is why
they live here rather than in either site's own directory.

Images are stored as WebP, not PNG — a raw Firefox capture of this UI runs
5-10x larger as PNG for no visible quality gain at the sizes these are
displayed. Keeping the repo's history free of multi-hundred-KB PNGs matters
more than the last few % of image quality.

## Taking screenshots

```sh
make screenshots                       # all of them
make screenshots ARGS="schedule-grid"  # only the named ones
```

`scripts/screenshots/` does the rest: it seeds a throwaway database with the
**large** profile (400 guests, hundreds of proposals — the small profile is the
E2E fixture set and makes the app look like a toy), starts its own `next dev`
server, drives Firefox as the attendee **Hana Kobayashi** (whose 1-on-1 states
the shots need, see the seed script) and writes WebP files straight into this
directory. Your dev database is not touched, but stop `make dev` first:
Next.js runs one dev server per checkout. It takes a few minutes.

- The footer shows the newest released version in `CHANGELOG.md`; set
  `APP_VERSION=vX.Y.Z` to override.
- Desktop shots are 1280x950 ("Laptop with touch"), mobile ones 360x736 at
  2.5x (900px wide, "Galaxy Note 9"), all in the light theme except the one
  dark shot named below.
- `schedule-grid` also regenerates `www/og-image.jpg`, the Open Graph card on
  the landing page — a separate JPEG because link-preview crawlers handle
  WebP inconsistently.
- How each shot is reached is in `scripts/screenshots/shots.ts`. When the UI
  changes so that a shot no longer matches its description below, fix the
  recipe there rather than capturing by hand.
- `make screenshots ARGS=--serve` leaves the seeded server running, to explore.

After capturing, update the captions in `www/screenshots.html` (and
`www/index.html`'s hero image and OpenGraph tags, if the hero shot changed),
run `make www`, open `www-site/screenshots.html` and click through the lightbox
to confirm captions still match what's on screen. `make www` fails if the HTML
references a file that is not here.

## Screenshot checklist

What each shot shows. Recapture them all when the UI changes materially.

### Desktop (1280x950)

- `home-multi-event.webp` — Home page listing multiple events with phase, dates, and quick links
- `proposals-browse.webp` — Proposal list with search, filters, and sortable columns
- `proposal-edit.webp` — Session proposal form (title, description, hosts, duration)
- `proposals-vote.webp` — Proposal list with Interested / Maybe / Skip voting
- `quick-voting.webp` — Quick Voting mode, one proposal at a time
- `proposals-results.webp` — Proposal list in the **scheduling** phase: "Your vote" column and ❤️/⭐ vote counts (only visible once voting is over)
- `proposal-vote-breakdown.webp` — A proposal's popup in the **scheduling** phase, showing the vote breakdown and the "expect N–M people" prediction. Open it as the host (Hana Kobayashi) of a proposal with enough votes, or the box is withheld
- `schedule-grid.webp` — Scheduling grid with room photos, taken at the top of day one so the viewer's own 1-on-1 column is in it (also used as the site hero and as the landing page's only 1-on-1 shot; also regenerates `www/og-image.jpg`, see above)
- `session-details.webp` — Session detail popup (host, location, time, attendees, description)
- `add-session.webp` — Form for adding a session directly to the schedule
- `meetings-availability.webp` — The **1-on-1s** section of Settings with an event's panel open: the "I'm open to 1-on-1s" switch on, and a day's slots as checkboxes with some of them cleared
- `meeting-request.webp` — The request form behind **Schedule a 1-on-1** on another attendee's profile, with a slot picked, a meeting point chosen and a line of context typed. Ahmad Karimi's profile has slots to offer on the event's first day: the afternoon he declared reads **Busy**, because Hana is in a session for all of it, and the rest of the day is **Unavailable**
- `meeting-answer.webp` — The 1-on-1 waiting for Hana's reply (Aisha Diallo's, 15:00 on day one), opened from her column of the grid: Accept, Decline, and the clash warning
- `meetings-schedule-column.webp` — The scheduling grid's first column, picture and all, with Hana's own 1-on-1s in it. Scroll the grid so day one's whole afternoon is in view
- `meeting-book-from-grid.webp` — "Who's free at …?", from the **+** on an empty slot of that column. Take it on 14:30, where the seeded attendees are bookable — most hours nobody is free, and the popup then has nothing to show
- `attendees.webp` — Searchable attendee directory with avatars and host badges
- `participant-profile.webp` — Participant profile page (bio, proposals, sessions they're hosting)
- `edit-profile.webp` — Edit profile form (name, pronouns, avatar, Markdown bio)
- `user-settings.webp` — Settings page (email notification preferences, account protection) — **capture this one in dark theme**, so both sites show that the app has one; it is the natural page for it, since the theme switch sits under Appearance right there
- `kiosk-mode.webp` — Schedule grid in kiosk mode, with the red current-time line visible
- `admin-events.webp` — Admin panel listing all events with a Manage button
- `admin-event-settings.webp` — Admin event configuration form (name, dates, timezone, rules)
- `admin-meetings.webp` — The **Meetings** section of the same form: 1-on-1s enabled, the suggested meeting points, and the cap on open requests

### Mobile (Galaxy Note 9)

- `mobile-schedule.webp` — Scheduling grid rendered on a phone screen
- `mobile-session-details.webp` — Mobile session detail popup **with closed-session warning**
