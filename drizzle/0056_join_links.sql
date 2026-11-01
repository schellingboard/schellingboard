CREATE TABLE `join_tokens` (
	`hash` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`event_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `join_tokens_guest_event` ON `join_tokens` (`guest_id`,`event_id`);--> statement-breakpoint
ALTER TABLE `guests` ADD `password_set_at` text;