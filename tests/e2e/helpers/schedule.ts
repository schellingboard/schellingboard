import { expect, type Page } from "@playwright/test";

export const viewButton = (page: Page, name: string) =>
  page
    .getByRole("group", { name: "Schedule view" })
    .getByRole("button", { name });

const VIEW_PARAMS: Record<string, string> = {
  Grid: "grid",
  Agenda: "agenda",
  Text: "text",
  "RSVP'd": "rsvp",
};

// The toggle is server-rendered, so a click can land before React has attached
// its handler and be dropped — retry until the view has actually switched
// (docs/dev/testing.md § E2E conventions). The button is pressed at once, but
// the view itself only follows with the navigation, which updates the URL once
// the new view is on screen.
export const switchToView = async (page: Page, name: string) => {
  await expect(async () => {
    await viewButton(page, name).click();
    await expect(viewButton(page, name)).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 2000 }
    );
  }).toPass();
  await expect(page).toHaveURL(new RegExp(`[?&]view=${VIEW_PARAMS[name]}\\b`));
};

export const filterChip = (page: Page, name: string) =>
  page
    .getByRole("group", { name: "Filter sessions" })
    .getByRole("button", { name });
