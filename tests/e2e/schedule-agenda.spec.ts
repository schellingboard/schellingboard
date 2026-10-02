import { test, expect } from "./helpers/fixtures";
import { login, loginAndGoto } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { openGammaScheduleDuringEvent } from "./helpers/dev-clock";
import { filterChip, switchToView, viewButton } from "./helpers/schedule";

// The agenda view: behind its own toolbar button, the grid staying the default
// everywhere.

const KEYNOTE = /Opening Keynote - Conference Gamma/;

test.describe("on a phone-sized screen", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the agenda lists each time's sessions with their room and end", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/Conference-Gamma");
    await expect(viewButton(page, "Grid")).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await switchToView(page, "Agenda");
    const keynote = page.getByRole("link", { name: KEYNOTE });
    await expect(keynote).toBeVisible();
    await expect(keynote).toContainText("Main Hall");
    await expect(keynote).toContainText("until 10:30");

    // Lunch blocks every room at once, and is listed once, not once per room.
    const lunchSlot = page.getByRole("region", { name: "12:30" }).first();
    await expect(lunchSlot.getByText("Lunch Break")).toHaveCount(1);
  });

  test("a narrowed agenda leads back to its search from further down", async ({
    page,
  }) => {
    await loginAndGoto(page, "/Conference-Gamma");
    await switchToView(page, "Agenda");
    const search = page.getByRole("searchbox", { name: "Search sessions" });
    await search.fill("Main Hall");
    await page
      .getByRole("link", { name: /Closing Session/ })
      .scrollIntoViewIfNeeded();
    await expect(search).not.toBeInViewport();

    await page.getByRole("button", { name: /\d+ of \d+ match/ }).click();
    await expect(search).toBeInViewport();
  });
});

test("the agenda groups sessions by start time and opens their details", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await switchToView(page, "Agenda");
  // The seeded keynote is an organizer's, starting at 09:00 without a break.
  const nineOClock = page.getByRole("region", { name: "09:00" }).first();
  await nineOClock.getByRole("link", { name: KEYNOTE }).click();
  await expect(
    page.getByRole("dialog", { name: "Session details" })
  ).toBeVisible();
});

// Zanele's first Gamma morning holds seeded 1-on-1s in the 10:00 slot, one no
// session starts in (see meetings-column.spec.ts). They are hers alone: the
// grid gives her a column for them, the agenda a time of their own — shown
// after the break, as a session in that slot would be.
test("the viewer's own 1-on-1s are listed at their time", async ({ page }) => {
  await loginAndGoto(page, "/guests");
  await selectUser(page, "Zanele Khumalo");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  await switchToView(page, "Agenda");

  const tenOClock = page.getByRole("region", { name: "10:10" }).first();
  const confirmed = tenOClock.getByRole("link", {
    name: /1-on-1 with Leilani Kahale/,
  });
  const waiting = tenOClock.getByRole("link", {
    name: /1-on-1 with Samuel Adeyemi/,
  });
  // The confirmed one carries the same mark as a session she has RSVP'd to;
  // the one still waiting for an answer does not.
  await expect(
    confirmed.getByRole("img", { name: "This 1-on-1 is confirmed" })
  ).toBeVisible();
  await expect(waiting).toBeVisible();
  await expect(waiting.getByRole("img")).toHaveCount(0);

  await confirmed.click();
  const details = page.getByRole("dialog", { name: "1-on-1 details" });
  await expect(
    details.getByRole("heading", { name: "1-on-1 with Leilani Kahale" })
  ).toBeVisible();
});

test("searching the agenda narrows it to sessions and 1-on-1s that match", async ({
  page,
}) => {
  await loginAndGoto(page, "/guests");
  await selectUser(page, "Zanele Khumalo");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  await switchToView(page, "Agenda");
  const search = page.getByRole("searchbox", { name: "Search sessions" });
  const apiDesign = page.getByRole("link", { name: /API Design/ });

  // Only the API design session's description says "comparative".
  await search.fill("comparative");
  await expect(apiDesign).toBeVisible();
  await expect(page.getByRole("link", { name: KEYNOTE })).toBeHidden();
  await expect(page.getByText("Lunch Break")).toBeHidden();
  await expect(page.getByText(/^1 of \d+ match/)).toBeVisible();

  await search.fill("Leilani");
  await expect(
    page.getByRole("link", { name: /1-on-1 with Leilani Kahale/ })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /1-on-1 with Samuel Adeyemi/ })
  ).toBeHidden();
  await expect(apiDesign).toBeHidden();

  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(apiDesign).toBeVisible();
  await expect(page.getByRole("link", { name: KEYNOTE })).toBeVisible();
  await expect(page.getByText(/\d+ of \d+ match/)).toBeHidden();
});

// Charlie hosts the React session and has an RSVP for Open Source
// Sustainability in the seed; API Design is neither.
test("filters narrow the agenda to the viewer's own sessions, each one further", async ({
  page,
}) => {
  await loginAndGoto(page, "/Conference-Gamma");
  await switchToView(page, "Agenda");
  // Filtering by "mine" needs a name to go on.
  await expect(
    page.getByRole("group", { name: "Filter sessions" })
  ).toBeHidden();

  await selectUser(page, "Charlie Test");
  const hosted = page.getByRole("link", { name: /Building Scalable Web/ });
  const rsvpd = page.getByRole("link", { name: /Open Source Sustainability/ });
  const neither = page.getByRole("link", { name: /API Design/ });

  await filterChip(page, "Hosting").click();
  await expect(filterChip(page, "Hosting")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(hosted).toBeVisible();
  await expect(rsvpd).toBeHidden();
  await expect(neither).toBeHidden();

  // Chips combine like the attendee directory's: a host doesn't RSVP to
  // their own session, so hosting and RSVP'd together leaves nothing.
  await filterChip(page, "RSVP'd").click();
  await expect(hosted).toBeHidden();
  await expect(page.getByText(/^0 of \d+ match/)).toBeVisible();

  await filterChip(page, "Hosting").click();
  await expect(rsvpd).toBeVisible();
  await expect(hosted).toBeHidden();

  // The filter is part of the address, so it survives a reload.
  await page.reload();
  await expect(filterChip(page, "RSVP'd")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(rsvpd).toBeVisible();
  await expect(hosted).toBeHidden();

  await filterChip(page, "RSVP'd").click();
  await filterChip(page, "My sessions").click();
  await expect(rsvpd).toBeVisible();
  await expect(hosted).toBeVisible();
  await expect(neither).toBeHidden();

  await page.getByRole("button", { name: "Show all" }).click();
  await expect(neither).toBeVisible();
  await expect(filterChip(page, "My sessions")).toHaveAttribute(
    "aria-pressed",
    "false"
  );
});

test("the viewer's own 1-on-1s stay listed under every filter", async ({
  page,
}) => {
  await loginAndGoto(page, "/guests");
  await selectUser(page, "Zanele Khumalo");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  await switchToView(page, "Agenda");

  await filterChip(page, "Hosting").click();
  await expect(
    page.getByRole("link", { name: /1-on-1 with Leilani Kahale/ })
  ).toBeVisible();
  await filterChip(page, "RSVP'd").click();
  await expect(
    page.getByRole("link", { name: /1-on-1 with Leilani Kahale/ })
  ).toBeVisible();
});

test.describe("while the event is running", () => {
  // At 16:00 the marker sits after day one's last group, only a few rows down
  // the list; a short viewport keeps it off screen until Now is pressed.
  test.use({
    timezoneId: "Europe/Berlin",
    viewport: { width: 1280, height: 500 },
  });

  test("the agenda marks the current time and Now jumps to it", async ({
    page,
  }) => {
    await openGammaScheduleDuringEvent(page, "/Conference-Gamma");
    await switchToView(page, "Agenda");

    const nowLine = page.getByTestId("now-line");
    await expect(nowLine).toBeAttached();
    await expect(nowLine).not.toBeInViewport();

    await page.getByRole("button", { name: "Now" }).click();
    await expect(nowLine).toBeInViewport();

    // 16:00 falls inside the seeded 15:30–16:30 session and after the keynote.
    await expect(
      page.getByRole("link", { name: /API Design: RESTful vs GraphQL/ })
    ).toContainText("Now");
    await expect(page.getByRole("link", { name: KEYNOTE })).not.toContainText(
      "Now"
    );
  });
});
