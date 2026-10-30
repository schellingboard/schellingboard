ALTER TABLE `guests` ADD `username` text;--> statement-breakpoint
CREATE UNIQUE INDEX `guests_username_unique` ON `guests` (`username`);