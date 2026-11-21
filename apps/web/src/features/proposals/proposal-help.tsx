import { proposalHelpOf } from "@schellingboard/domain/proposal-help";
import { useState } from "react";

import { Markdown } from "../../ui/markdown";
import { SidePanel } from "../../ui/side-panel";

export function ProposalHelp({ event }: { event: { proposalHelp: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-md border border-line px-4 py-2 hover:bg-surface-hover"
      >
        Need ideas?
      </button>
      {open && (
        <SidePanel
          label="Need ideas?"
          title="Need ideas?"
          onClose={() => setOpen(false)}
          transient
        >
          <Markdown className="text-sm">{proposalHelpOf(event)}</Markdown>
        </SidePanel>
      )}
    </>
  );
}
