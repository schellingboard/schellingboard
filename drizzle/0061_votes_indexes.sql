CREATE INDEX `votes_guest_idx` ON `votes` (`guest_id`);--> statement-breakpoint
CREATE INDEX `votes_proposal_choice_idx` ON `votes` (`proposal_id`,`choice`);