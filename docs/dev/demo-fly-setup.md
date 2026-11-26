# One-time Fly.io setup of the demo

How the Fly.io side of [the public demo](demo.md) is created. It is needed once, or again to rebuild
the demo from nothing; releases deploy on their own afterwards. Commands were checked against the
Fly documentation and flyctl `v0.5.18` in November 2026.

## What lives outside the repository

| Where        | What                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| Fly          | the app `schellingboard-demo`, its IP addresses                            |
| Fly          | the volume `demo_data` (1 GB, `fra`)                                       |
| Fly          | the secret `AUTH_SECRET`, the certificate for the domain                   |
| DNS provider | the records for `demo.schellingboard.org`                                  |
| GitHub       | the environment `demo` with the secret `FLY_API_TOKEN`, a Fly deploy token |

Everything else is in `fly.toml` and the `demo` job of
[`release.yml`](https://github.com/schellingboard/schellingboard/blob/main/.github/workflows/release.yml).

## Before you start

- [Install flyctl](https://docs.fly.io/flyctl/install) and run `fly auth login`.
- Pick the Fly organization and give it a payment card. The machine and volume cost a few dollars a
  month; see [pricing](https://docs.fly.io/about/pricing) for what the Free plan covers.
- Run the commands below from the repository root, so that flyctl reads the app name from
  `fly.toml`.

## Steps

1. **Create the app.** App names are global. If you have to pick another, change it in `fly.toml`
   and in the `IMAGE` of the workflow job. Do not use `fly launch`, which rewrites `fly.toml`.

   ```bash
   fly apps create schellingboard-demo --org <org>
   ```

2. **Create the volume.** Confirm the warning about a single volume: the demo runs one machine and
   its data is disposable. Snapshots stay off, so visitor content does not outlive the daily reset.

   ```bash
   fly volumes create demo_data --size 1 --region fra --scheduled-snapshots=false
   ```

3. **Set the session secret.**

   ```bash
   fly secrets set AUTH_SECRET="$(openssl rand -base64 32)"
   ```

4. **Create the GitHub environment**, open to `v*` tags only, so that no branch or pull request
   workflow can read the token. Do this before the first run of the `demo` job: GitHub creates a
   missing environment itself, without any restriction.

   ```bash
   env=repos/schellingboard/schellingboard/environments/demo
   gh api -X PUT "$env" \
     -F 'deployment_branch_policy[protected_branches]=false' \
     -F 'deployment_branch_policy[custom_branch_policies]=true'
   gh api -X POST "$env/deployment-branch-policies" -f 'name=v*' -f type=tag
   ```

5. **Store the deploy token** in that environment. It can manage this app only. Paste the whole
   output of the first command, including the `FlyV1` prefix and the space after it, at the prompt
   of the second.

   ```bash
   fly tokens create deploy --name github-actions --expiry 8760h
   gh secret set FLY_API_TOKEN --env demo --repo schellingboard/schellingboard
   ```

6. **Deploy the first time.** With a release tag that contains the demo:

   ```bash
   gh workflow run release.yml --ref vX.Y.Z -f demo_only=true
   ```

   Without such a tag, deploy from your checkout:

   ```bash
   IMAGE=registry.fly.io/schellingboard-demo:manual
   docker build --platform linux/amd64 --target demo \
     --build-arg "APP_VERSION=$(bun scripts/app-version.js)" -t "$IMAGE" .
   fly auth docker
   docker push "$IMAGE"
   fly deploy --image "$IMAGE"
   ```

   The first deploy creates one machine (a group with a volume gets no spare), an IPv6 address and a
   shared IPv4 address.

7. **Add the domain.** Check that `fly ips list` shows both addresses; if not, run
   `fly ips allocate-v4 --shared` and `fly ips allocate-v6`. Then:

   ```bash
   fly certs add demo.schellingboard.org
   fly certs setup demo.schellingboard.org   # prints the DNS records
   ```

   Create those records at the DNS provider, then repeat `fly certs check demo.schellingboard.org`
   until the certificate is issued.

## Verify

- `fly machine list` shows exactly one machine, and its health check passes.
- `curl https://demo.schellingboard.org/demo/status` answers with the next reset time.
- Signing in works on the demo domain.
- `fly logs` shows no warning about `X-Forwarded-For`. To check `SB_TRUSTED_PROXIES`, enter a wrong
  password for one account until it is refused as too many attempts, then try from another network:
  that attempt must not be refused the same way.
- After 03:00 UTC, `fly logs` shows `scheduled reset: exiting` and then `database reseeded`.

## Upkeep

- **Token**: it expires after a year, without a warning. The demo keeps running, but the next `demo`
  job fails at the deploy step; the release itself succeeds. Repeat step 5, re-run the failed job,
  and revoke the old token (`fly tokens list`, `fly tokens revoke <id>`).
- **flyctl in CI**: the workflow pins `version:` of `setup-flyctl`. Dependabot updates the action
  but not this input, so raise it by hand now and then.
- **Removal**: `fly apps destroy schellingboard-demo` also deletes the volume. Delete the GitHub
  environment and the DNS records too, and remove the `demo` job.

## Sources

- [Continuous deployment with GitHub Actions](https://docs.fly.io/launch/continuous-deployment-with-github-actions).
  The demo job differs on purpose: it builds on the runner and deploys with `--image`, so that the
  tested image is the deployed one, and it pins its actions and flyctl.
- [Access tokens](https://docs.fly.io/security/tokens)
- [Custom domains](https://docs.fly.io/networking/custom-domain)
- [Volumes](https://docs.fly.io/volumes/volume-manage)
- [`fly.toml` reference](https://docs.fly.io/reference/configuration)
- [Request headers](https://docs.fly.io/networking/request-headers): why two proxies are trusted
- [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
