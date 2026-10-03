export enum VoteChoice {
  interested = "interested",
  maybe = "maybe",
  skip = "skip",
}

export type Vote = {
  id: string;
  proposalId: string;
  guestId: string;
  choice: VoteChoice;
};
