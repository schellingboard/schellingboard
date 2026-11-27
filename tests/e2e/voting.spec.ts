import type { Page } from "@playwright/test";

import { login, loginAndGoto } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { uniqueSuffix } from "./helpers/unique";
import { selectUser } from "./helpers/user";

test("should allow voting on proposals with different choices @005-US1", async ({
  page,
}) => {
  await login(page);

  // Go to proposals list for Open Source Summit (voting phase)
  await page.goto("/Open-Source-Summit/proposals");

  // Select a user via the header name picker
  await selectUser(page, /Alice Test/i);

  // Choose a proposal created by Charlie Test
  const proposalRow = page.getByRole("row", {
    name: /Networking & Coffee Chat: Connect with Open Source Summit Peers/,
  });

  // Verify the row exists
  await expect(proposalRow).toBeVisible();

  // Vote "Interested" (❤️ emoji button)
  const interestedButton = proposalRow.getByRole("button", { name: "❤️" });
  await interestedButton.click();

  // The chosen vote is exposed as a pressed toggle and marked with a check,
  // not by background colour alone (see issue #802).
  await expect(interestedButton).toHaveAttribute("aria-pressed", "true");
  await expect(interestedButton).toContainText("✓");

  // Change vote to "Maybe" (⭐ emoji button)
  const maybeButton = proposalRow.getByRole("button", { name: "⭐" });
  await maybeButton.click();

  // Verify the maybe button is now active and interested is not
  await expect(maybeButton).toHaveAttribute("aria-pressed", "true");
  await expect(maybeButton).toContainText("✓");
  await expect(interestedButton).toHaveAttribute("aria-pressed", "false");
  await expect(interestedButton).not.toContainText("✓");

  // Change vote to "Skip" (👋🏽 emoji button)
  const skipButton = proposalRow.getByRole("button", { name: "👋🏽" });
  await skipButton.click();

  // Verify the skip button is now active and others are not
  await expect(skipButton).toHaveAttribute("aria-pressed", "true");
  await expect(maybeButton).toHaveAttribute("aria-pressed", "false");
  await expect(interestedButton).toHaveAttribute("aria-pressed", "false");
});

test("should navigate to quick voting and allow voting on proposals @005-US2", async ({
  page,
}) => {
  await login(page);

  // Go to proposals list for Open Source Summit (voting phase)
  await page.goto("/Open-Source-Summit/proposals");

  // Select a user via the header name picker
  await selectUser(page, /Bob Test/i);

  // Click on "Go to Quick Voting!" link
  await page.getByRole("link", { name: /Go to Quick Voting!/i }).click();

  // Verify we're on the quick voting page
  await expect(page).toHaveURL(
    /\/Open-Source-Summit\/proposals\/quick-voting$/
  );
  await expect(page.getByText(/Quick Voting/i)).toBeVisible();

  // Bob always has something left to vote on: the three event-specific Beta
  // proposals are seeded without any votes at all (see
  // eventSpecificTitlePatterns in scripts/seed/data/templates.ts) and Bob
  // hosts at most one of them.
  const progress = page.getByText(/You have voted on \d+ \/ \d+ proposals/);
  await expect(progress).toBeVisible();
  const before = Number(/\d+/.exec((await progress.textContent()) ?? "")?.[0]);
  const interestedButton = page.getByRole("button", { name: /❤️ Interested/i });
  await expect(interestedButton).toBeVisible();

  await interestedButton.click();

  // The counter is updated optimistically from the votes loaded with the page
  // — so it counts up by exactly one even when another worker votes as Bob too.
  await expect(progress).toHaveText(
    new RegExp(`You have voted on ${before + 1} / `)
  );
  // ...and the page moves on to the next proposal, or to the end of the queue.
  await expect(
    interestedButton.or(page.getByText(/You have voted on all proposals/))
  ).toBeVisible();

  // Navigate back to proposals overview
  await page.getByRole("link", { name: /← Proposals/i }).click();
  await expect(page).toHaveURL(/\/Open-Source-Summit\/proposals$/);
});

test("shows a proposal's comments read-only while quick voting @005-US2", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Open-Source-Summit/proposals");
  await selectUser(page, "Marta Horvat");
  await page.getByRole("link", { name: /Go to Quick Voting!/i }).click();

  await expect(
    page.getByRole("heading", { name: /^\d+ comments?$/ })
  ).toBeVisible();
  await expect(page.getByPlaceholder("Add a comment")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reply" })).toHaveCount(0);
});

test("opens the full proposal from Quick Voting and returns to the same place @005-US2", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Open-Source-Summit/proposals");
  await selectUser(page, "Dmitri Volkov");
  await page.getByRole("link", { name: /Go to Quick Voting!/i }).click();

  // Voting first: coming back must not offer the proposal just voted on again.
  const title = page.getByRole("main").getByRole("heading", { level: 1 });
  const voted = await title.textContent();
  await page.getByRole("button", { name: /❤️ Interested/i }).click();
  await expect(title).not.toHaveText(voted ?? "");
  const current = (await title.textContent()) ?? "";

  await title.getByRole("link", { name: current }).click();
  const modal = page.getByRole("dialog", { name: "Proposal details" });
  await expect(modal.getByRole("heading", { name: current })).toBeVisible();
  await expect(modal.getByPlaceholder("Add a comment")).toBeVisible();

  await modal.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(
    /\/Open-Source-Summit\/proposals\/quick-voting$/
  );
  await expect(title).toHaveText(current);
});

test("votes from two users persist independently across reloads @005-US1", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Open-Source-Summit/proposals");

  // Create a throwaway proposal as Bob Test, who is prefilled as its host.
  // The host matters twice over: hosts get no voting buttons on their own
  // proposals, so the voters below must be someone else; and the quick-voting
  // test in this file votes as Bob in a parallel worker, where quick voting
  // never offers proposals the current user hosts, so no other test can add
  // votes to this proposal.
  await selectUser(page, /Bob Test/i);
  const title = `E2E Vote Target ${uniqueSuffix()}`;
  await page.getByRole("link", { name: /Add Proposal/i }).click();
  await page.getByLabel("Title").fill(title);
  await Promise.all([
    page.waitForURL(/\/Open-Source-Summit\/proposals$/),
    page.getByRole("button", { name: /Submit/i }).click(),
  ]);

  // Vote as Alice
  await selectUser(page, /Alice Test/i);

  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row).toBeVisible();

  // Vote "Interested". Voting updates optimistically, so wait for the server
  // to confirm before reloading.
  await Promise.all([
    page.waitForResponse((res) => res.url().includes("/votes/") && res.ok()),
    row.getByRole("button", { name: "❤️" }).click(),
  ]);

  // The vote persists across a reload
  await page.reload();
  await expect(row).toBeVisible();
  await expect(row.getByRole("button", { name: "❤️" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  // A second user votes on the same proposal with a different choice.
  // (There is no visible aggregate tally during the voting phase, so the
  // combined count is asserted per-user here; tally aggregation is covered
  // by tests/integration/voting.test.ts.)
  await selectUser(page, /Charlie Test/i);
  await expect(row.getByRole("button", { name: "❤️" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  await Promise.all([
    page.waitForResponse((res) => res.url().includes("/votes/") && res.ok()),
    row.getByRole("button", { name: "⭐" }).click(),
  ]);

  // Each user still sees their own vote after a reload
  await page.reload();
  await expect(row).toBeVisible();
  await expect(row.getByRole("button", { name: "⭐" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await selectUser(page, /Alice Test/i);
  await expect(row.getByRole("button", { name: "❤️" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(row.getByRole("button", { name: "⭐" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
});

test("voting without a name opens the name picker, then votes once one is chosen @005-US1", async ({
  page,
}) => {
  await loginAndGoto(page, "/Open-Source-Summit/proposals");

  // Not the first row: the voting-phase sort puts proposals other tests have
  // just created there, and voting on them breaks those tests.
  const row = page.getByRole("row", { name: /Building Inclusive Tech Teams/ });
  await expect(row).toBeVisible();
  const interested = row.getByRole("button", { name: "❤️" });

  await interested.click();
  await page.getByLabel("My name is:").fill("Alice Test");
  await page.getByRole("option", { name: /Alice Test/i }).click();

  await expect(
    page.getByRole("button", { name: "Your name: Alice Test" })
  ).toBeVisible();
  // Other specs vote on shared seed rows in parallel, so only the change is certain.
  const before = await interested.getAttribute("aria-pressed");
  await interested.click();
  await expect(interested).toHaveAttribute(
    "aria-pressed",
    before === "true" ? "false" : "true"
  );
});

// Web Unconference is in the scheduling phase, where the vote breakdown is
// shown. Hana Kobayashi hosts the first proposal; nobody hosts the second.
const HOSTED_PROPOSAL = "Writing Documentation People Actually Read";
const HOSTLESS_PROPOSAL = "Ask Me Anything: Migrating a Legacy Monolith";

async function openProposal(page: Page, event: string, title: string) {
  await page.goto(`/${event}/proposals`);
  await page.getByPlaceholder("Search proposals").fill(title);
  // The search is debounced; a click before it lands hits a row the
  // re-render then replaces, and the click is lost.
  await expect(page.getByRole("combobox", { name: "Sort by" })).toBeDisabled();
  await page.getByRole("link", { name: title }).click();
  const modal = page.getByRole("dialog", { name: "Proposal details" });
  await expect(modal).toBeVisible();
  return modal;
}

const openGammaProposal = (page: Page, title: string) =>
  openProposal(page, "Web-Unconference", title);

test("a host sees the vote breakdown of their own proposal @005-US3", async ({
  page,
}) => {
  await loginAndGoto(page, "/Web-Unconference/proposals");
  await selectUser(page, "Hana Kobayashi");

  const modal = await openGammaProposal(page, HOSTED_PROPOSAL);
  const breakdown = modal.getByRole("region", { name: "Vote breakdown" });

  await expect(breakdown.getByText(/of \d+ attendees/)).toBeVisible();
  await expect(breakdown.getByText(/Did not vote/)).toBeVisible();
  await expect(breakdown.getByText(/Interested/)).toBeVisible();
  await expect(breakdown.getByText(/Maybe/)).toBeVisible();
  await expect(breakdown.getByText(/Skip/)).toBeVisible();
  await expect(
    breakdown.getByText(/If you decide to host this as a session, expect \d/)
  ).toBeVisible();
});

test("someone else's proposal keeps its vote breakdown private @005-US3", async ({
  page,
}) => {
  await loginAndGoto(page, "/Web-Unconference/proposals");
  await selectUser(page, /Alice Test/i);

  const modal = await openGammaProposal(page, HOSTED_PROPOSAL);

  await expect(
    modal.getByRole("region", { name: "Vote breakdown" })
  ).toHaveCount(0);
});

test("a proposal nobody hosts shows its vote breakdown to everyone @005-US3", async ({
  page,
}) => {
  await loginAndGoto(page, "/Web-Unconference/proposals");
  await selectUser(page, /Alice Test/i);

  const modal = await openGammaProposal(page, HOSTLESS_PROPOSAL);

  await expect(
    modal.getByRole("region", { name: "Vote breakdown" })
  ).toBeVisible();
});

// Seeded with a host (Charlie Test) but no votes at all — below the turnout
// the estimate needs.
const UNVOTED_PROPOSAL = "Web Unconference Lightning Talks: Community Showcase";

test("a proposal hardly anyone voted on gets no attendance guess @005-US4", async ({
  page,
}) => {
  await loginAndGoto(page, "/Web-Unconference/proposals");
  await selectUser(page, /Charlie Test/i);

  const modal = await openGammaProposal(page, UNVOTED_PROPOSAL);
  const breakdown = modal.getByRole("region", { name: "Vote breakdown" });

  await expect(breakdown.getByText(/Too few attendees voted/)).toBeVisible();
  await expect(
    breakdown.getByText(/If you decide to host this as a session/)
  ).toHaveCount(0);
});

// Open Source Summit is in the voting phase; Charlie Test hosts this proposal.
const BETA_HOSTED_PROPOSAL =
  "Networking & Coffee Chat: Connect with Open Source Summit Peers";

test("a host sees the vote breakdown of their own proposal while voting @005-US3", async ({
  page,
}) => {
  await loginAndGoto(page, "/Open-Source-Summit/proposals");
  await selectUser(page, "Charlie Test");

  const modal = await openProposal(
    page,
    "Open-Source-Summit",
    BETA_HOSTED_PROPOSAL
  );

  await expect(
    modal
      .getByRole("region", { name: "Vote breakdown" })
      .getByText(/of \d+ attendees/)
  ).toBeVisible();
});
