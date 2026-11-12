import { t } from "@lingui/core/macro";

export function defaultProposalHelp(): string {
  const questions = [
    t`What did you learn recently that you could explain in 20 minutes?`,
    t`What problem are you stuck on? Ask the group for input.`,
    t`What would you like to learn? Propose it and ask for a host.`,
    t`Which question do you want to discuss with people who disagree with you?`,
    t`What work or project could you present, and get feedback on?`,
    t`Which practical skill could you teach (a demo, a workshop, a hands-on session)?`,
    t`Which topic did you enjoy at an earlier event? Do it again, or take it further.`,
    t`What would be fun and not work-related (a game, a walk, music)?`,
    t`Which talk, book or article would you like to discuss?`,
  ];
  return [
    t`Not sure what to propose? Start from one of these questions.`,
    questions.map((q) => `- ${q}`).join("\n"),
    `${t`A session can be a talk, a discussion, a workshop or a 1-on-1.`} ${t`Everyone then votes on the proposals, and the most wanted ones go on the schedule.`}`,
  ].join("\n\n");
}

export const proposalHelpOf = (event: { proposalHelp: string }) =>
  event.proposalHelp.trim() || defaultProposalHelp();
