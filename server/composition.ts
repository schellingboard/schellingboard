import { after } from "next/server";
import { getRepositories } from "@/db/container";
import { nudgeJobs } from "@/utils/jobs/nudge";
import {
  notifyCohostsAdded,
  notifyProfileCommented,
  notifyProposalCommented,
  notifyProposalJoined,
  notifySessionCommented,
} from "@/utils/notifications";
import {
  createCommentUseCases,
  type CommentDeps,
  type CommentUseCases,
} from "@/server/modules/comments/module";
import {
  createProposalUseCases,
  type ProposalUseCases,
} from "@/server/modules/proposals/module";
import {
  createSessionUseCases,
  type SessionUseCases,
} from "@/server/modules/sessions/module";

// Built per call: tests swap the repository container between cases.
export function sessionUseCases(): SessionUseCases {
  return createSessionUseCases({
    repos: getRepositories(),
    notifyCohostsAdded,
    nudgeJobs,
  });
}

export function proposalUseCases(): ProposalUseCases {
  return createProposalUseCases({
    repos: getRepositories(),
    notifyProposalJoined: (args) => after(() => notifyProposalJoined(args)),
  });
}

const notifyCommented: CommentDeps["notifyCommented"] = ({
  subject,
  comment,
  now,
}) =>
  after(() => {
    if (subject.kind === "proposal")
      return notifyProposalCommented({ proposalId: subject.id, comment, now });
    if (subject.kind === "session")
      return notifySessionCommented({ sessionId: subject.id, comment, now });
    return notifyProfileCommented({ profileId: subject.id, comment, now });
  });

export function commentUseCases(): CommentUseCases {
  return createCommentUseCases({ repos: getRepositories(), notifyCommented });
}
