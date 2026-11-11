# Progress

## Decisions

## Problems

- #200: not checked in a browser at 390px (long URL, fixed vote bar); CSS read only.

## Questions

- #691: the script uses the API, not a browser, so identity requests per navigation (#1148) are
  counted as one per page load only.

- tests/unit/stats/correlation.test.ts "spearman property" failed once under fast-check in
  `make test-coverage`, passed on rerun; flaky, unrelated.

## Next step

Step 7.
