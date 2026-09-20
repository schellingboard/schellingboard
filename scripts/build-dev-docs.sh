#!/usr/bin/env bash
# Build the developer documentation site (developers.schellingboard.org) into
# dev-site/.
#
# Unlike the user docs, this site is not versioned: it is built from the
# working tree and published from main, so it always describes the default
# branch. See docs/dev/adr/0008-publish-developer-docs.md.
#
# Three things are assembled here:
#
#   1. docmd renders docs/dev/ into dev-site/.
#   2. `likec4 build` puts the whole C4 explorer — every view, with drill-down
#      — at /diagrams/, and drops the web component bundle beside it.
#   3. scripts/likec4-embed.js loads that bundle on the pages that embed a
#      <likec4-view view-id="…">. The chapters embed that element instead of
#      committed PNGs, so nothing can go stale.
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$PWD"

CONFIG="docmd.dev.config.mjs"
OUT="dev-site"
DIAGRAMS="docs/dev/target-architecture/diagrams"

# A <likec4-view> naming a view that no longer exists renders an empty box
# rather than failing, which is exactly the silent staleness the PNGs used to
# have. Fail the build instead.
missing=0
view_ids="$(grep -oE '(^|[[:space:]])(dynamic[[:space:]]+)?view[[:space:]]+[A-Za-z0-9_]+' "$DIAGRAMS/views.c4" | awk '{print $NF}' | sort -u)"
while read -r id; do
  [ -n "$id" ] || continue
  grep -qxF "$id" <<<"$view_ids" || {
    echo "view-id=\"$id\" is embedded in docs/dev/ but $DIAGRAMS/views.c4 defines no such view" >&2
    missing=1
  }
done < <(grep -rhoE 'view-id="[A-Za-z0-9_]+"' docs/dev --include='*.md' | sed 's/view-id="//;s/"//' | sort -u)
[ "$missing" -eq 0 ] || exit 1

rm -rf "$OUT"
bun x docmd build -c "$CONFIG"

# Same as the user site: docmd copies its own theme assets and nothing else, so
# the header logo and favicon named in the config have to be placed here.
cp -R "$REPO_ROOT/docs/logo" "$OUT/logo"
rm -f "$OUT/logo/README.md" # the usage guide is for contributors

# GitHub Pages can't route deep links to a single-page app, hence hash history.
bun x likec4 build --base /diagrams/ --use-hash-history -o "$OUT/diagrams" \
  --title "SchellingBoard architecture" "$DIAGRAMS"

# Robots only read /robots.txt at the origin, where docmd writes the site's
# own; likec4's copy would just look like the explorer is deindexed.
rm -f "$OUT/diagrams/robots.txt"

# docmd's SPA router otherwise hot-swaps this shell into the docs layout, which
# strips its stylesheet and module script; the attribute is the router's opt-out.
perl -pi -e 's|<body>|<body data-spa-enabled="false">|' "$OUT/diagrams/index.html"
grep -qF 'data-spa-enabled="false"' "$OUT/diagrams/index.html" || {
  echo "likec4's index.html no longer has a plain <body>: the SPA opt-out was not applied" >&2
  exit 1
}

cp scripts/likec4-embed.js "$OUT/assets/js/likec4-embed.js"

# Every page is dated from the commit that last touched it (see
# scripts/docmd-git-history.js); the user site published undated for a while
# before anyone noticed, so check rather than trust.
undated="$(grep -rLF 'class="git-last-updated"' --include='index.html' "$OUT" | grep -v "^$OUT/diagrams/" || true)"
if [ -n "$undated" ]; then
  echo "Pages built without a last-updated date:" >&2
  echo "$undated" >&2
  exit 1
fi

# GitHub Pages serves the custom domain from this file. Taken from the config's
# `url` so the domain is stated exactly once.
CONFIG="$CONFIG" OUT="$OUT" bun -e '
const config = await import("./" + process.env.CONFIG);
const { host } = new URL(config.default.url);
require("fs").writeFileSync(process.env.OUT + "/CNAME", host + "\n");
'

cat >"$OUT/README.md" <<'EOF'
# developers.schellingboard.org

Generated — do not edit this repository.

The site is built from `docs/dev/` in
[schellingboard/schellingboard](https://github.com/schellingboard/schellingboard) and
pushed here on every change to `main`. Edits made here are overwritten by the
next deploy.
EOF

echo "Developer documentation site built in $OUT/"
