# Statistics in the admin: later

The statistics are decided in [ADR 0019](adr/0019-statistics.md) and the figures are listed in
[Statistics: figures](statistics.md). Issue #389 is the brainstorm. This note keeps what is not
built.

## Later: what to collect for better statistics

Rough; each item needs its own design and an entry in the data collection statement (#801).

- **Coarse timestamps on votes and RSVPs** (to the hour): voting and RSVP timelines, "how late do
  people RSVP". Deleted with the vote or RSVP.
- **Aggregate counters without people**: RSVP cancellations per session, notification clicks per
  type, feature use per day (schedule, map, search). No ids, no addresses, no third-party analytics.
- **Daily snapshots**: the jobs loop writes a few event-wide counts per day to a table, since the
  change log is pruned. Gives history without per-person rows.
- **Attendance confirmation**: an attendee taps "I was there" (opt-in). Better than host counts and
  RSVPs. Stored as an RSVP flag, so it goes with the RSVP.
- **Anonymous ratings after a session** (#389, #1053): store the rating without a guest id; prevent
  a second rating with a separate "rated" row per (guest, session), deleted after the event.
- **Device class** (phone, desktop) per login session, not the user agent.
- **Rules for all of it**: data minimisation (collect what a figure needs, coarsen times), no
  per-person data that outlives the person's account, k ≥ 3 for anything shown, documented purpose
  and retention, aggregates only for anything kept after the event.
