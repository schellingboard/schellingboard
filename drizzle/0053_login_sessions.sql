CREATE TABLE `login_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`event_id` text,
	`assurance` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`device` text,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `login_sessions_guest_idx` ON `login_sessions` (`guest_id`);--> statement-breakpoint
CREATE INDEX `login_sessions_expires_idx` ON `login_sessions` (`expires_at`);