import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SidePanel } from "../../ui/side-panel";
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

  it(
    "shows the ideas in place inside the proposal form's panel",
    { tags: ["004-US8"] },
    async () => {
      const onClose = vi.fn();
      render(
        <SidePanel label="New proposal" title="New proposal" onClose={onClose}>
          <ProposalHelp event={{ proposalHelp: "" }} />
        </SidePanel>
      );
      const help = screen.getByRole("button", { name: "Need ideas?" });
      await userEvent.click(help);

      expect(onClose).not.toHaveBeenCalled();
      const form = screen.getByRole("dialog", { name: "New proposal" });
      expect(form.textContent).toContain("explain in 20 minutes");
      expect(help.getAttribute("aria-expanded")).toBe("true");
      await userEvent.click(help);
      expect(form.textContent).not.toContain("explain in 20 minutes");
    }
  );
});
