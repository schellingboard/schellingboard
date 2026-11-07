# Progress

## Facts for this run

- No pushes, no PRs (the user's rule); commits stay local.
- No real event database is available (privacy). Old data is checked through the release-upgrade
  fixtures and the dev seed only.
- The user's past event runs 3.8.1 and is upgraded to 5.0.0 before they use the page.

- Step 1 done. New admin code goes in `admin-pages.tsx`'s module graph so it stays in the lazy
  chunk.
- Environment: `make arch` fails with 26 violations on a clean tree (node_modules/.bun paths);
  `make lint` needs `NODE_OPTIONS=--max-old-space-size=8192`.

## Questions

None.
