import { useState } from "react";
import { proposalHelpOf } from "@schellingboard/domain/proposal-help";
import { Dialog } from "../../ui/dialog";
import { Markdown } from "../../ui/markdown";

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
      <Dialog open={open} onClose={() => setOpen(false)} title="Need ideas?">
        <Markdown className="text-sm">{proposalHelpOf(event)}</Markdown>
      </Dialog>
    </>
  );
}
