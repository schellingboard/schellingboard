# Glossary

The words used in the code and the docs. A word that already means something to attendees keeps that
meaning.

| Term                      | Meaning                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Site**                  | One installation, with site settings, guests and events.                                                                                  |
| **Event**                 | One conference or weekend, with days, locations, phases and members. "Something that happened in the system" is a _change_, not an event. |
| **Day**                   | A calendar date of an event in the event's time zone, with a booking window.                                                              |
| **Phase**                 | Proposal, voting or scheduling. Derived from the event's phase dates and the clock, never stored.                                         |
| **Location**              | A room or area where a session happens, with an optional image, colour and unavailable times. A meeting point is where a 1-on-1 happens.  |
| **Guest**                 | A person known to the site: name, profile, optional email, password and username. Site-wide.                                              |
| **Member**                | A guest assigned to an event.                                                                                                             |
| **Proposal**              | An idea for a session, with hosts, votes and comments.                                                                                    |
| **Vote**                  | Interested, maybe or skip, one per guest per proposal. A host sees the breakdown.                                                         |
| **Session**               | Something on the schedule: title, hosts, locations, start and end, capacity.                                                              |
| **RSVP**                  | A guest's commitment to attend a session. Counts toward capacity.                                                                         |
| **Meeting**               | A 1-on-1 between two guests in a slot, at a meeting point, with a request, accept, decline or cancel lifecycle.                           |
| **Actor** _(internal)_    | Who acts in a request: a guest with an assurance level, a site admin, or the system.                                                      |
| **Assurance**             | How sure the server is that the actor is the guest: _claimed_ (picked a name) or _verified_ (password, emailed code, join link).          |
| **Identity mode**         | An event's setting, `open` or `verified`, for the assurance its actions need.                                                             |
| **Login session**         | A server-side row for one browser's sign-in, referenced by the cookie.                                                                    |
| **Join link**             | A personal link that signs a guest in and adds them to an event.                                                                          |
| **Change**                | A recorded fact: type, subject, actor, time, payload, audience. Committed with the state it describes.                                    |
| **Change log**            | The append-only `changes` table, ordered by `seq`.                                                                                        |
| **Change feed**           | The per-viewer SSE stream of changes the viewer's audience permits, resumable from a `seq`.                                               |
| **Audience**              | Who may see a change, stored with it.                                                                                                     |
| **Snapshot**              | Everything one viewer may see of one event, at one `seq`.                                                                                 |
| **Replica**               | The client's copy of a snapshot, kept current by the feed and persisted for offline use.                                                  |
| **Reaction** _(internal)_ | A jobs-loop handler that turns recorded changes into notifications, at least once.                                                        |
| **Delivery**              | One email or push for one guest, sent by the jobs loop with retries.                                                                      |
| **Use case** _(internal)_ | One command or query in a module's `application/`: authorize, load, apply the rules, record changes, respond.                             |
| **Kernel** _(internal)_   | The server's shared code in `server/kernel/`: unit of work, change log, actor, `Result`.                                                  |
