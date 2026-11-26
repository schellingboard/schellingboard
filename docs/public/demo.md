---
title: "Public demo"
description: "What you can and cannot do on the public demo, and which accounts to sign in with."
type: guide
---

# The public demo

[demo.schellingboard.org](https://demo.schellingboard.org) runs SchellingBoard with sample data.

:::note "Everyone shares it"

Anyone can post there. Do not enter real data, and do not trust links. Report abuse to
[abuse@schellingboard.org](mailto:abuse@schellingboard.org).

:::

## Signing in

Pick any name without a password to act as that attendee. Names marked **(password)** all use the
password `schelling`, for example:

| Name         | Username     | What you can try                                              |
| ------------ | ------------ | ------------------------------------------------------------- |
| `Site Admin` | `site-admin` | The [admin UI](organizers/admin-guide.md) at `/admin`         |
| `Wei Chen`   | none         | A regular attendee with a [protected name](attendee-guide.md) |

## What you can try

The three sample events are each in a different [phase](organizers/how-it-works.md):

| Event              | Phase      | Try                                  |
| ------------------ | ---------- | ------------------------------------ |
| Hackathon          | Proposal   | Propose sessions and comment on them |
| Open Source Summit | Voting     | Vote on proposals                    |
| Web Unconference   | Scheduling | Schedule sessions and RSVP           |

As `Site Admin` you can also change events, days, locations, proposals and sessions, and add
attendees.

## What is turned off

Because the accounts are shared, you cannot:

- set, change or remove a password or username, or protect a name;
- grant or remove the site admin role;
- upload or remove a profile picture;
- upload a room picture or a venue map.

Most of these show **This is turned off on this site.**

The demo sends no email. There are no login codes, password reset links, notification emails or
mailed join links. Notifications inside the app work.

## Daily reset

Every day at 03:00 UTC, and when a new version is deployed, the demo deletes all changes and loads
fresh sample data. The notice at the top of the page counts down to the next reset. If you close the
notice, it shrinks to one line; select **Show info** to see all of it again.

Until then, other visitors can change or delete what you create, including sample attendees.

To keep your data, [run your own copy](self-hosting/deployment.md).
