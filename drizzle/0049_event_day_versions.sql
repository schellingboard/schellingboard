ALTER TABLE `days` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `version` integer DEFAULT 1 NOT NULL;