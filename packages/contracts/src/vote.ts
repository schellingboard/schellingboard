import { z } from "zod";
import { VoteChoice } from "@schellingboard/domain/vote";

const voteChoiceSchema = z.enum(VoteChoice);

export const voteViewSchema = z
  .object({
    id: z.string(),
    proposalId: z.string(),
    guestId: z.string(),
    choice: voteChoiceSchema,
  })
  .meta({ id: "Vote" });

export const voteListSchema = z.object({ votes: z.array(voteViewSchema) });

export const voteCastSchema = z.object({ choice: voteChoiceSchema });
