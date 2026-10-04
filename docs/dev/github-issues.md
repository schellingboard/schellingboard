# Creating and Reading GitHub Issues

This repo uses two conventions beyond GitHub's built-in issue fields: an **Issue Type**
(`Task` / `Bug` / `Feature`) and a custom single-select **Priority** field (`Urgent` / `High` /
`Medium` / `Low`). Type and Priority carry that information instead of labels — the only labels
in regular use are the `component: *` ones below.

## Component labels

Each issue should get one `component: *` label indicating the area it touches:

| Label                      | Scope                                          |
| -------------------------- | ---------------------------------------------- |
| `component: proposals`     | Proposal creation/listing/editing              |
| `component: voting`        | Voting (table + Quick Voting)                  |
| `component: scheduling`    | Sessions, session grid, scheduling phase       |
| `component: admin`         | `/admin` backend                               |
| `component: attendees`     | Attendee list, profiles, RSVPs on profiles     |
| `component: 1-on-1s`       | 1-on-1 meetings: booking, availability, column |
| `component: auth`          | Login, passwords, protected accounts           |
| `component: infra & dev`   | CI, testing, tooling, perf, security, upgrades |
| `component: notifications` | Email and in-app notifications                 |
| `component: ui/ux`         | Cross-cutting styling/layout/accessibility     |
| `component: other`         | Reviewed, no suitable component                |

`gh issue create`/`edit` can set labels directly (no GraphQL needed):

```bash
gh issue edit 123 -R schellingboard/schellingboard --add-label "component: scheduling"
```

**Always pass `-R schellingboard/schellingboard`** to `gh issue`/`gh pr` commands. Without it
`gh` infers the repo from git remotes and fails (`not a git repository`) when run from a
workspace, a jj-only checkout or a subdirectory.

Neither field is exposed by `gh issue create`/`gh issue edit`/`gh issue view` — both require the
GraphQL API (`gh api graphql`).

## Reading an issue's type and priority

`gh issue view --json` doesn't expose either field. Use REST instead:

```bash
gh api repos/schellingboard/schellingboard/issues/123 --jq \
  '{type: .type.name, priority: (.issue_field_values[]? | select(.issue_field_name=="Priority") | .single_select_option.name)}'
```

## IDs needed for mutations

Repo id, issue type ids, and the Priority field/option ids (stable, but re-fetch if unsure):

```bash
gh api graphql -f query='
{ repository(owner: "schellingboard", name: "schellingboard") {
    id
    issueTypes(first: 10) { nodes { id name } }
} }'

gh api graphql -f query='
{ repository(owner: "schellingboard", name: "schellingboard") {
    issueFields(first: 20) { nodes { ... on IssueFieldSingleSelect { id name options { id name } } } }
} }'
```

Known values as of 2026-09-29 (double-check if a query above disagrees):

| Name             | ID                    |
| ---------------- | --------------------- |
| Repo             | `R_kgDOUhaF9Q`        |
| Type: Task       | `IT_kwDOE75_iM40KuIP` |
| Type: Bug        | `IT_kwDOE75_iM40KuIQ` |
| Type: Feature    | `IT_kwDOE75_iM40KuIR` |
| Priority field   | `IFSS_kgDOAs8wdA`     |
| Priority: Urgent | `IFSSO_kgDOBOrxxw`    |
| Priority: High   | `IFSSO_kgDOBOrxyA`    |
| Priority: Medium | `IFSSO_kgDOBOrxyQ`    |
| Priority: Low    | `IFSSO_kgDOBOrxyg`    |

## Creating an issue with type and priority set

```bash
gh api graphql -f query='
mutation($repo: ID!, $title: String!, $body: String!, $type: ID!, $prioField: ID!, $prioOpt: ID!) {
  createIssue(input: {
    repositoryId: $repo, title: $title, body: $body, issueTypeId: $type,
    issueFields: [{ fieldId: $prioField, singleSelectOptionId: $prioOpt }]
  }) { issue { number url } }
}' \
  -f repo=R_kgDOUhaF9Q \
  -f title="Issue title" \
  -f body="$(cat body.md)" \
  -f type=IT_kwDOE75_iM40KuIR \
  -f prioField=IFSS_kgDOAs8wdA \
  -f prioOpt=IFSSO_kgDOBOrxyg
```

## Changing type/priority on an existing issue

Get the issue's node id first (`number` is not a valid GraphQL id):

```bash
gh api graphql -f query='{ repository(owner: "schellingboard", name: "schellingboard") { issue(number: 123) { id } } }'
```

Then:

```bash
# Type
gh api graphql -f query='
mutation($issue: ID!, $type: ID!) {
  updateIssueIssueType(input: { issueId: $issue, issueTypeId: $type }) { issue { number } }
}' -f issue=<issue node id> -f type=<type id>

# Priority
gh api graphql -f query='
mutation($issue: ID!, $field: ID!, $opt: ID!) {
  setIssueFieldValue(input: { issueId: $issue, issueFields: [{ fieldId: $field, singleSelectOptionId: $opt }] }) { issue { number } }
}' -f issue=<issue node id> -f field=IFSS_kgDOAs8wdA -f opt=<priority option id>
```

## Body format conventions

Match existing issues' style:

- Sections as needed, in this rough order: `## Overview` / `## Current behavior` / `## Proposed
behavior` (or `## Proposed change`/`## Proposed fix`) / `## Why` / `## Impact` / `## Notes`
- Small bugs/tasks can just be a short paragraph — headers aren't mandatory.
- Reference file:line for code-specific bugs (e.g. `` `app/actions/user-auth.ts:130` ``).
- Keep it succinct; this is a scheduling app issue tracker, not a spec document.
