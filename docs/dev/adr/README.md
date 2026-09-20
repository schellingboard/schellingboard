# Architecture decision records

One record per decision that was expensive to make and would be expensive to
revisit: what the situation was, what was chosen, and what that costs. They are
not updated as the code moves on — a decision that no longer holds gets a new
ADR superseding it, so the reasoning at the time stays readable.

Write one when a choice constrains later work (a dependency, a data model, a
protocol, a deployment shape), not for every design discussion. Number it after
the highest existing ADR and give it the same header block: status, date, and
the tracking issue where there is one.

| ADR                                                  | Decision                                                    | Date       |
| ---------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| [0001](0001-replace-airtable-with-sql-database.md)   | Replace Airtable with a SQL database                        | 2026-04-16 |
| [0002](0002-testing-strategy.md)                     | Testing strategy                                            | 2026-04-23 |
| [0003](0003-form-field-validation-with-zod.md)       | Form handling and validation with React Hook Form and Zod   | 2026-07-02 |
| [0004](0004-dev-fake-clock.md)                       | Dev fake clock for time-traveling event phases              | 2026-07-23 |
| [0005](0005-dark-mode.md)                            | Dark mode via semantic tokens and a per-device cookie       | 2026-08-17 |
| [0006](0006-push-notifications.md)                   | Push notifications through an installable web app           | 2026-09-05 |
| [0007](0007-attendee-count-and-reminder-dispatch.md) | Attendee count storage and in-process reminder dispatch     | 2026-08-25 |
| [0008](0008-publish-developer-docs.md)               | Publish the developer docs at developers.schellingboard.org | 2026-09-18 |

Longer design work that isn't a single decision lives next door:
[Target architecture](../target-architecture/README.md) and
[Attendance model](../attendance-model/README.md).
