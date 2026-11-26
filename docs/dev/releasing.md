# Releasing a New Version

Pushing the tag is the whole release: it triggers
[`release.yml`](https://github.com/schellingboard/schellingboard/blob/main/.github/workflows/release.yml)
(build the image, run E2E against it, publish to Docker Hub, open the GitHub release) and
[`docs.yml`](https://github.com/schellingboard/schellingboard/blob/main/.github/workflows/docs.yml)
(rebuild the docs site, serving `docs/public/` as of that tag at its root). Docs are versioned per
minor release, so `v3.2.1` republishes the `3.2` documentation.

## Checklist

- [ ] Changelog: `[Unreleased]` renamed to `[X.Y.Z] - date`, compare link updated
- [ ] In-app release notes released, highlights re-read against the changelog
- [ ] `make dump-release-db VERSION=vX.Y.Z` run
- [ ] Screenshots checked, recaptured where the UI changed
- [ ] Release commit merged to `main`
- [ ] Optional: `make test-e2e-docker` on the release commit
- [ ] Tag pushed (point of no return)
- [ ] Release workflow green
- [ ] Changelog and in-app notes reopened

## Steps

1. **Prepare the release commit.** All of the following go in one commit.

   - **Changelog**: in `CHANGELOG.md`, rename `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD` (no `v`
     prefix) and point the `[Unreleased]` compare link at the new version: previous release to
     `vX.Y.Z`. Do _not_ add a fresh `[Unreleased]` section yet; the tag must carry none, because the
     docs site publishes it. Step 4 reopens it.
   - **In-app notes**: in `packages/domain/src/release-notes.ts`, replace the first entry's
     `version: "Unreleased"` with this version and add its `date`. Rename the same key in
     `apps/web/src/app/release-highlights.ts`. `make test` fails until the newest changelog release
     has an entry.
   - **Highlights**: re-read them against the finalized changelog. They were written one at a time
     and are a draft. Keep only the 3-5 changes an attendee or organizer would call the release's
     highlights; rewrite or replace the rest.
   - **Release database**: run `make dump-release-db VERSION=vX.Y.Z` so future releases are tested
     against an upgrade from this one. It writes no dump when there is no new migration, only the
     `tests/fixtures/upgrade/releases.json` entry. `make test` fails until the entry exists, and
     being inside the tag, patch releases branched off it get it too. See
     [Release-upgrade tests](testing.md#release-upgrade-tests).
   - **Screenshots**: compare the changelog against `docs/screenshots/`. A changed screen, a new
     feature with a UI, or a footer version shown in a shot means a recapture. Run
     `make screenshots ARGS="name ..."` for the affected shots, or all after broad UI changes, and
     review the images. Add shots for new UI features to `scripts/screenshots/shots.ts`. See
     [`docs/screenshots/README.md`](https://github.com/schellingboard/schellingboard/blob/main/docs/screenshots/README.md).

   Commit and merge it like any other change.

2. **Tag the commit on `main` and push the tag.** This publishes the documentation. Only repository
   administrators can push it.

   ```bash
   jj git fetch
   jj tag set v3.0.0 -r main@origin
   jj git push --tag v3.0.0
   # git: git fetch origin main
   #      git tag v3.0.0 origin/main
   #      git push origin v3.0.0
   ```

   Optionally run `make test-e2e-docker` on the release commit first. The workflow runs it too and
   publishes nothing if it fails; running it locally only lets you fix a failure before the tag is
   public.

3. **Watch the release workflow.** It takes about fifteen minutes, mostly E2E against the image.

4. **Reopen the changelog.** In a follow-up commit on `main`: add an empty `## [Unreleased]` above
   `## [X.Y.Z]`, with an `[Unreleased]` compare link from `vX.Y.Z` to `HEAD`. In
   `packages/domain/src/release-notes.ts`, add a new first entry with `version: "Unreleased"` and no
   `date`, and add an empty `Unreleased` list to `releaseHighlights`. Drop highlights of releases
   the modal no longer shows.

## What the release workflow does

Triggered by a `v*.*.*` tag, in one job, so nothing is published until everything before it has
passed:

- **Builds the image** through `scripts/docker-build.sh` — the same script `make docker-build` runs
  — with `APP_VERSION` taken from the tag rather than from `scripts/app-version.js`, which asks `jj`
  or `git describe` and can't be trusted on a CI checkout.
- **Runs the E2E suite against that image** (`make test-e2e-docker`, with `IMAGE` naming the image
  just built, so it is not rebuilt). This is the only tier that runs the artifact we ship, and the
  last chance to catch a fault that exists only in it — a file the Dockerfile didn't copy, a path
  that resolves differently under `/data`, a date rendered in the server's timezone rather than the
  event's. See [Testing the Docker image](testing.md#testing-the-docker-image). The report and the
  traces of failed attempts are uploaded as an artifact.
- **Pushes four tags** to `schellingboard/schellingboard`: the full version, `major.minor`, `major`,
  and `latest`. `scripts/release-tags.ts` decides the last one from the repository's tags —
  `:latest` has to keep meaning the newest published release, so a patch cut from an older line
  (`v3.3.2` released after `v3.4.0`) publishes its own three tags and leaves `:latest` alone.
- **Creates the GitHub release**, last, so a release exists only once its images do. It is marked as
  GitHub's "latest" on the same condition as the `:latest` tag.

Images are `linux/amd64` only, which is what has always been published.

A second job, `demo`, runs after `release` only when the release took over `:latest`. It runs
`make test-e2e-demo` against the `demo` Dockerfile target, then pushes that same image to Fly's
registry and runs `flyctl deploy --image` (`fly.toml`). Dispatch the workflow against a tag with
`demo_only` to redeploy the demo without publishing anything.

### Repository configuration

The workflow needs these repository secrets:

| Secret               | Value                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DOCKERHUB_USERNAME` | The Docker Hub account that can push to `schellingboard/schellingboard`.                                                                                     |
| `DOCKERHUB_TOKEN`    | A Docker Hub [access token](https://app.docker.com/settings/personal-access-tokens) for that account with **Read & Write** scope — not the account password. |

The demo job also needs `FLY_API_TOKEN`, a deploy token for the `schellingboard-demo` app, as a
secret of the environment `demo`. That and everything on Fly is created by hand, see
[One-time Fly.io setup of the demo](demo-fly-setup.md).

Nothing else: the GitHub release is created with the automatic `GITHUB_TOKEN`, which the workflow
grants `contents: write`.

A `v*` tag publishes a release and opens the `demo` environment, so the ruleset "Protect release
tags" lets only repository administrators create, move or delete one. To create it again:

```bash
gh api -X POST repos/schellingboard/schellingboard/rulesets --input - <<'JSON'
{
  "name": "Protect release tags",
  "target": "tag",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "rules": [{ "type": "creation" }, { "type": "update" }, { "type": "deletion" }],
  "bypass_actors": [
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }
  ]
}
JSON
```

`actor_id` 5 is the repository's admin role.

### If it fails

Nothing has been published unless the run reached the "Publish the image" step, so a failing build
or E2E gate leaves Docker Hub and the releases page untouched. The tag and the documentation are
out, though, and re-cutting a tag that people may already have fetched is worse than moving on: fix
the problem on `main` and release the next patch version.

A failure _after_ the gate — a Docker Hub outage, a flake — is different: the tag is fine and only
the publishing didn't happen. Re-run the workflow (or dispatch it against the tag). Every step in it
can be repeated safely.

### Publishing by hand

Only if the workflow itself is unavailable. `scripts/release-tags.ts` prints exactly what would be
pushed:

```bash
VERSION=v3.0.0

docker login
jj new $VERSION      # git: git checkout $VERSION
make clean
IMAGE="$(APP_VERSION=$VERSION bash scripts/docker-build.sh)"
for ref in $(bun scripts/release-tags.ts "$IMAGE"); do
  docker tag "$IMAGE" "$ref"
  docker push "$ref"
done
```

## Patch Releases

A patch release is cut from the release branch of its minor version, `release/<major.minor>` —
`release/3.2` for `v3.2.1`. These branches don't have to exist: create one from the release tag the
first time that version needs a fix, and a minor release that never needs one never gets a branch.

```bash
jj new v3.2.0
jj bookmark create release/3.2   # git: git switch -c release/3.2 v3.2.0
```

Commit the fix there (cherry-picking it from `main` if it landed there first), then run the steps
above against the branch instead of `main`, and merge the branch back into `main` so the fix is not
lost. Whether the patch takes over `:latest` is not a decision to make: the workflow works it out
from the tags.

Pushing the branch republishes that version's documentation on its own, without a tag — the docs
build prefers `release/<major.minor>` over the tag for that version, which is also how published
docs are corrected between releases. See
[Correcting published documentation](documentation.md#correcting-published-documentation).
