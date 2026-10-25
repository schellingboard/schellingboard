import { durationMinusBreak } from "@schellingboard/domain/slots";
import { formatDuration } from "@schellingboard/domain/time";
import { Markdown } from "../../ui/markdown";
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
  return (
    <>
      {proposal.hosts.length === 0 ? (
        <p className="mb-4 text-lg font-medium italic text-fg-subtle">
          No host yet — someone would like this session to be offered
        </p>
      ) : (
        <p className="mb-4 text-lg font-medium text-fg-muted">
          {proposal.hosts.map((h, i) => (
            <span key={h.id}>
              {i > 0 && ", "}
              <a
                href={links.guest(h.id)}
                className="text-brand-fg hover:text-brand-fg-hover hover:underline"
              >
                {h.name}
              </a>
            </span>
          ))}
        </p>
      )}
      {proposal.cohostWanted && (
        <p className="mb-4 text-sm italic text-fg-muted">
          Looking for a co-host
          {proposal.cohostWantedNote && `: ${proposal.cohostWantedNote}`}
        </p>
      )}
      <div className="mb-3">
        <Markdown>{proposal.description ?? ""}</Markdown>
      </div>
      {proposal.durationMinutes && (
        <p className="mb-4 text-sm text-fg-muted">
          Duration:{" "}
          {formatDuration(
            durationMinusBreak(proposal.durationMinutes, breakMinutes),
            true
          )}
        </p>
      )}
    </>
  );
}
