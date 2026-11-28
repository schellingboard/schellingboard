ALTER TABLE `guests` ADD `name_unconfirmed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_create_people` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_name_header` text DEFAULT '' NOT NULL;