ALTER TABLE `site_settings` ADD `proxy_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_header` text DEFAULT 'X-Forwarded-Email' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_secret_hash` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_addresses` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_logout_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `proxy_site_admins` integer DEFAULT false NOT NULL;