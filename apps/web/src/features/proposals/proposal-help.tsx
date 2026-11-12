import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
        <Trans>Need ideas?</Trans>
      </button>
      {open && (
        <SidePanel
          label={t`Need ideas?`}
          title={t`Need ideas?`}
          onClose={() => setOpen(false)}
          transient
        >
          <Markdown className="text-base leading-relaxed">
            {proposalHelpOf(event)}
          </Markdown>
        </SidePanel>
      )}
    </>
  );
}
