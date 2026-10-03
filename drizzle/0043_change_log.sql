CREATE TABLE `changes` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`event_id` text,
	`type` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`occurred_at` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `changes_id_unique` ON `changes` (`id`);--> statement-breakpoint
CREATE INDEX `changes_event_seq_idx` ON `changes` (`event_id`,`seq`);--> statement-breakpoint
CREATE INDEX `changes_subject_idx` ON `changes` (`subject_type`,`subject_id`,`seq`);