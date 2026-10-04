import { getRepositories } from "@/db/container";
import { nudgeJobs } from "@/utils/jobs/nudge";
import { notifyCohostsAdded } from "@/utils/notifications";
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
  return createProposalUseCases({ repos: getRepositories() });
}
