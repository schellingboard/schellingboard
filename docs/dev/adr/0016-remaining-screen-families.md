# ADR 0016: The remaining screen families

- **Status:** Accepted
- **Date:** 2026-10-25, amended 2026-10-28 (point 4, see [ADR 0017](0017-identity-and-roles.md))

## Context

[ADR 0015](0015-spa-alongside-next.md) moved the schedule to the SPA and left the other screens in
Next under `/legacy`. This ADR settles how the rest move: proposals and voting, people and meetings,
the session forms, settings and notifications, and admin. It also amends
[ADR 0014](0014-change-feed-and-snapshot.md), because proposals and votes were not in the snapshot.

## Decision

1. **Proposals and votes are in the replica.** Public proposal fields and hosts are in the snapshot
   and the feed. The viewer's own votes are in `me.votes`, visible only to the voter. The vote
   breakdown stays an on-demand query
   ([02](https://github.com/schellingboard/schellingboard/blob/fb2a2cba1d05ab0421aee2985bc0d75db3c41323/docs/dev/target-architecture/02-domain.md)).
2. **Failed commands name what failed**, so that the user can recover. The notice names the subject:
   a session by title, day, time and room; a proposal by title; a 1-on-1 by the other person and
   slot. It tells "refused" (a `4xx`, with the reason) apart from "might not have been saved"
   (retries given up). It stays visible after the control that started it unmounts. RSVPs and
   comments first, then every new command.
3. **The session forms move in this run**, after meetings. Then the Next schedule goes.
4. **The sign-in screens stay legacy** (guest password login, reset, `/login`, admin login) until
   path step 6 replaces them. No API for passwords: step 6 replaces identity, so it would be thrown
   away.
5. **Admin uses `queries/` and awaited mutations**, not the replica: admin data spans events and is
   in no snapshot. A mutation waits for the response, maps problem details onto fields, shows `409`
   as "changed by someone else", then refetches.
6. **Forms** (proposal, profile, session, settings, admin) use the same awaited mutation helper and
   the zod contracts per field (ADR 0003, #639). Forms need server validation per field before they
   close; votes, RSVPs, comments, likes and 1-on-1 answers are optimistic commands, because a toggle
   needs an instant response.
7. **Addresses do not change.** The SPA keeps the legacy paths and query params (`viewProposal`,
   `viewMeeting`, `bookMeeting`, …), so emails, push, QR codes and bookmarks keep working.

### Amendment to ADR 0014

The snapshot gains the event's proposals and `me.votes`; the feed gains proposal and vote changes. A
proposal is its public fields and hosts (with names): not `sessionIds`, which the sessions'
`proposalId` give, and not the tally or breakdown, which depend on votes and phase.
`proposal.changed` is also recorded when a host joins, and when deleting or renaming a guest changes
the hosts of their proposals (a host's name is not in the event's guests unless they are a member).
The logged proposal carries no vote counts. Votes are `vote.cast` (a new or changed choice) and
`vote.withdrawn`; both reach only the voter's connection. A vote lost by becoming a host or with its
proposal is recorded as `vote.withdrawn`. Other viewers get no vote counts from the feed.

## Consequences

- Proposal lists and voting work from the replica, and update live.
- The feed grows by proposal changes; vote changes are per viewer.
- Admin screens refetch after every mutation and do not update live.
- Two sets of form code (legacy and SPA) exist until each family's takeover.

## Alternatives

- **Proposals as on-demand queries.** Smaller snapshot, but voting would lose optimistic updates and
  live changes.
- **Admin in the replica.** Admin data spans events; a snapshot cannot hold it.
