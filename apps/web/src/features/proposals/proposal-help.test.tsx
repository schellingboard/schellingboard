import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ProposalHelp } from "./proposal-help";

afterEach(cleanup);

async function openHelp(proposalHelp: string) {
  render(<ProposalHelp event={{ proposalHelp }} />);
  await userEvent.click(screen.getByRole("button", { name: "Need ideas?" }));
  return screen.getByRole("dialog", { name: "Need ideas?" });
}

describe("proposal help", () => {
  it(
    "shows the default ideas when the organizer wrote nothing",
    { tags: ["004-US8"] },
    async () => {
      const dialog = await openHelp("");
      expect(dialog.textContent).toContain("explain in 20 minutes");
    }
  );

  it(
    "shows the organizer's text instead of the default",
    { tags: ["004-US8"] },
    async () => {
      const dialog = await openHelp("Ask **Sam** about the venue");
      expect(dialog.textContent).toContain("Ask Sam about the venue");
      expect(dialog.textContent).not.toContain("explain in 20 minutes");
    }
  );
});
