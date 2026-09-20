#!/usr/bin/env bash
# Check the developer docs for broken relative links.
#
# `docmd validate` has no --config flag: it reads docmd.config.json from the
# working directory and validates whatever `src` names, which is the user docs.
# So the developer docs are validated from a scratch directory whose `docs`
# symlink points at docs/dev/ — the reported paths then read as "docs/x.md"
# rather than a long relative climb, and docmd.config.json stays untouched.
#
# Links out of docs/dev/ are absolute GitHub URLs on purpose (the published
# site's root is docs/dev/, so a relative one resolves to nothing). External
# links are skipped by the validator, which is exactly what makes this check
# tell the two apart.
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$PWD"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

ln -s "$REPO_ROOT/docs/dev" "$WORK/docs"
printf '{"title":"SchellingBoard Developers","src":"docs","out":"dev-site"}\n' >"$WORK/docmd.config.json"

cd "$WORK"
"$REPO_ROOT/node_modules/.bin/docmd" validate
