ALTER TABLE `events` ADD `identity_mode` text DEFAULT 'open' NOT NULL;--> statement-breakpoint
CREATE INDEX `event_guests_guest_idx` ON `event_guests` (`guest_id`);