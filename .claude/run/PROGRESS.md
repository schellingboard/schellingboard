# Progress

## Decisions

- Session branch: `claude/uow-feed`.
- Checks per step, by the user's standing instruction: `make format lint arch
openapi-check typecheck test-coverage` (or `make test`), without E2E. E2E runs
  only for UI steps; the user runs the full E2E suite at the end.
- Step 1: ADR 0013 written with options (a), (b), (c); it recommends (c). Docs
  only, so its checks were `make format` and `make docs-dev-validate`.

## Problems

None.

## Questions

- Step 1: choose the unit-of-work option in ADR 0013 (a/b/c); steps 2–3 wait for it.

## Next step

4 (steps 2–3 blocked).
