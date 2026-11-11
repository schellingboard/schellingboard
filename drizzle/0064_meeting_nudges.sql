CREATE TABLE `meeting_nudges` (
	`event_id` text NOT NULL,
	`asker_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`created_at` text NOT NULL,
	`answered_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asker_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meeting_nudges_no_duplicate` ON `meeting_nudges` (`event_id`,`asker_id`,`recipient_id`);--> statement-breakpoint
CREATE INDEX `meeting_nudges_recipient_idx` ON `meeting_nudges` (`event_id`,`recipient_id`);