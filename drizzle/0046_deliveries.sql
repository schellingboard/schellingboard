CREATE TABLE `deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`channel` text NOT NULL,
	`payload` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` text,
	`first_failed_at` text,
	`last_error` text,
	`sent_at` text,
	`abandoned_at` text,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deliveries_due_idx` ON `deliveries` (`sent_at`,`abandoned_at`);--> statement-breakpoint
CREATE INDEX `deliveries_guest_idx` ON `deliveries` (`guest_id`);