CREATE TABLE `event_labels` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_labels_event_idx` ON `event_labels` (`event_id`);--> statement-breakpoint
CREATE TABLE `guest_labels` (
	`event_label_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`event_label_id`, `guest_id`),
	FOREIGN KEY (`event_label_id`) REFERENCES `event_labels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guest_labels_guest_idx` ON `guest_labels` (`guest_id`);