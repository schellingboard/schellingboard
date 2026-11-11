# Progress

## Decisions

## Problems

## Questions

- #691 finding: 1000 attendees arriving at 20/s give 5xx or no answer on 30-40 % of page loads and
  p99 over 100 s; 200 attendees pass (page-load p99 about 4 s). The cause (server or the single
  client process) is not known. Needs its own issue.
- #691: the script uses the API, not a browser, so identity requests per navigation (#1148) are
  counted as one per page load only.

## Next step

Step 2.
