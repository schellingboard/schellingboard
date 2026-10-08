ALTER TABLE `session_proposals` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `version` integer DEFAULT 1 NOT NULL;