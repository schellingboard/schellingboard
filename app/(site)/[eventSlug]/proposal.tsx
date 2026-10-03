"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import type { SessionProposal } from "@/db/repositories/interfaces";
import { formatDuration, durationMinusBreak } from "@/utils/utils";
import { useBreakMinutes } from "@/app/(site)/context";
import { Markdown } from "@/app/(site)/markdown";

export function Proposal(props: {
  proposal: SessionProposal;
  titleLink?: Omit<ComponentProps<typeof Link>, "children" | "className">;
}) {
  const { proposal, titleLink } = props;
  const breakMinutes = useBreakMinutes();
  return (
    <>
      <h1 className="text-xl font-semibold mb-2 mt-5">
        {titleLink ? (
          <Link {...titleLink} className="hover:underline">
            {proposal.title}
          </Link>
        ) : (
          proposal.title
        )}
      </h1>
      {proposal.hosts.length === 0 ? (
        <p className="text-lg font-medium italic text-fg-subtle mb-4">
          No host yet — someone would like this session to be offered
        </p>
      ) : (
        <p className="text-lg font-medium text-fg-muted mb-4">
          {proposal.hosts.map((h, i) => (
            <span key={h.id}>
              {i > 0 && ", "}
              <Link
                href={`/guests/${h.id}`}
                className="text-brand-fg hover:text-brand-fg-hover hover:underline"
              >
                {h.name}
              </Link>
            </span>
          ))}
        </p>
      )}
      {proposal.cohostWanted && (
        <p className="text-sm italic text-fg-muted mb-4">
          Looking for a co-host
          {proposal.cohostWantedNote && `: ${proposal.cohostWantedNote}`}
        </p>
      )}
      <div className="mb-3">
        <Markdown>{proposal.description}</Markdown>
      </div>
      {proposal.durationMinutes && (
        <p className="text-sm text-fg-muted mb-4">
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
