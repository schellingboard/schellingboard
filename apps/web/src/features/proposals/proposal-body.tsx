import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { durationMinusBreak } from "@schellingboard/domain/slots";
import { formatDuration } from "@schellingboard/domain/time";

import { Markdown } from "../../ui/markdown";
import { PersonLink } from "../people/person-link";
import type { ProposalLinks } from "./links";

/** Who hosts a proposal and what it is about: shared by the modal and quick voting. */
export function ProposalBody({
  proposal,
  links,
  breakMinutes,
}: {
  proposal: {
    hosts: { id: string; name: string }[];
    cohostWanted: boolean;
    cohostWantedNote?: string | null;
    description?: string | null;
    durationMinutes?: number | null;
  };
  links: Pick<ProposalLinks, "guest">;
  breakMinutes: number;
}) {
  const cohostNote = proposal.cohostWantedNote;
  const duration = proposal.durationMinutes
    ? formatDuration(
        durationMinusBreak(proposal.durationMinutes, breakMinutes),
        true
      )
    : "";
  return (
    <>
      {proposal.hosts.length === 0 ? (
        <p className="mb-4 text-lg font-medium italic text-fg-subtle">
          <Trans>No host yet — someone would like to see this offered</Trans>
        </p>
      ) : (
        <p className="mb-4 text-lg font-medium text-fg-muted">
          {proposal.hosts.map((h, i) => (
            <span key={h.id}>
              {i > 0 && ", "}
              <PersonLink
                guestId={h.id}
                href={links.guest(h.id)}
                name={h.name}
                className="text-brand-fg hover:text-brand-fg-hover hover:underline"
              />
            </span>
          ))}
        </p>
      )}
      {proposal.cohostWanted && (
        <p className="mb-4 text-sm italic text-fg-muted">
          {cohostNote
            ? t`Looking for a co-host: ${cohostNote}`
            : t`Looking for a co-host`}
        </p>
      )}
      <div className="mb-3">
        <Markdown className="text-base leading-relaxed">
          {proposal.description ?? ""}
        </Markdown>
      </div>
      {proposal.durationMinutes && (
        <p className="mb-4 text-sm text-fg-muted">{t`Duration: ${duration}`}</p>
      )}
    </>
  );
}
