CREATE TABLE `bootstrap_tokens` (
	`hash` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `guests` ADD `site_admin` integer DEFAULT false NOT NULL;