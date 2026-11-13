import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useId, useState } from "react";

import { Markdown } from "../../ui/markdown";
import { SidePanel, useInSidePanel } from "../../ui/side-panel";
import { proposalHelpOf } from "./default-proposal-help";

export function ProposalHelp({ event }: { event: { proposalHelp: string } }) {
  const [open, setOpen] = useState(false);
  // A second panel would replace the one this button is in, form and all.
  const inPanel = useInSidePanel();
  const id = useId();
  const text = (
    <Markdown className="text-base leading-relaxed">
      {proposalHelpOf(event)}
    </Markdown>
  );
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(inPanel ? !open : true)}
        aria-expanded={inPanel ? open : undefined}
        aria-controls={inPanel && open ? id : undefined}
        className="cursor-pointer rounded-md border border-line px-4 py-2 hover:bg-surface-hover"
      >
        <Trans>Need ideas?</Trans>
      </button>
      {open &&
        (inPanel ? (
          <div
            id={id}
            className="mt-2 rounded-md border border-line bg-surface-sunken p-4"
          >
            {text}
          </div>
        ) : (
          <SidePanel
            label={t`Need ideas?`}
            title={t`Need ideas?`}
            onClose={() => setOpen(false)}
            transient
          >
            {text}
          </SidePanel>
        ))}
    </>
  );
}
