CREATE TABLE `location_unavailability` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`location_id` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `location_unavailability_event_idx` ON `location_unavailability` (`event_id`);