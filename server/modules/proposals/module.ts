export type { ProposalDeps } from "./ports";
export type { VoteInput } from "./application/votes";
export {
  createProposalUseCases,
  type ProposalUseCases,
} from "./application/use-cases";
export { addProposalRoutes } from "./http/routes";
