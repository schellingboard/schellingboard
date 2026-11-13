ALTER TABLE `events` ADD `read_access` text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `link_token` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `kiosk_token` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `events` SET `link_token` = lower(hex(randomblob(16))), `kiosk_token` = lower(hex(randomblob(16)));--> statement-breakpoint
CREATE UNIQUE INDEX `events_link_token_unique` ON `events` (`link_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `events_kiosk_token_unique` ON `events` (`kiosk_token`);
