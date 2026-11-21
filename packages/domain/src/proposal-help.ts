export const DEFAULT_PROPOSAL_HELP = `Not sure what to propose? Start from one of these questions.

- What did you learn recently that you could explain in 20 minutes?
- What problem are you stuck on? Ask the group for input.
- What would you like to learn? Propose it and ask for a host.
- Which question do you want to discuss with people who disagree with you?
- What work or project could you present, and get feedback on?
- Which practical skill could you teach (a demo, a workshop, a hands-on session)?
- Which topic did you enjoy at an earlier event? Do it again, or take it further.
- What would be fun and not work-related (a game, a walk, music)?
- Which talk, book or article would you like to discuss?

A session can be a talk, a discussion, a workshop or a 1-on-1. Everyone then votes on the proposals, and the most wanted ones go on the schedule.`;

export const proposalHelpOf = (event: { proposalHelp: string }) =>
  event.proposalHelp.trim() || DEFAULT_PROPOSAL_HELP;
