CREATE TABLE `shared_moments` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shared_moments_day_idx` ON `shared_moments` (`day_id`);