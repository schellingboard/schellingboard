ALTER TABLE `locations` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `meeting_points` ADD `version` integer DEFAULT 1 NOT NULL;