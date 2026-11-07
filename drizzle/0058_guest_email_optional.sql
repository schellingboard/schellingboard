PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_guests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`about_me` text,
	`pronouns` text,
	`based_in` text,
	`prompts` text,
	`languages` text,
	`contacts` text,
	`email_on_rsvp_change` integer DEFAULT true NOT NULL,
	`email_on_host_change` integer DEFAULT true NOT NULL,
	`email_on_cohost_add` integer DEFAULT true NOT NULL,
	`email_on_proposal_join` integer DEFAULT true NOT NULL,
	`email_on_proposal_comment` integer DEFAULT true NOT NULL,
	`email_on_session_comment` integer DEFAULT true NOT NULL,
	`email_on_profile_comment` integer DEFAULT true NOT NULL,
	`email_on_comment_thread` integer DEFAULT false NOT NULL,
	`email_on_meeting_request` integer DEFAULT true NOT NULL,
	`email_on_meeting_response` integer DEFAULT true NOT NULL,
	`email_on_session_heads_up` integer DEFAULT true NOT NULL,
	`email_on_attendee_count_reminder` integer DEFAULT true NOT NULL,
	`avatar_url` text,
	`profile_updated_at` text,
	`auth_protected` integer DEFAULT false NOT NULL,
	`password_hash` text,
	`username` text,
	`password_set_at` text,
	`site_admin` integer DEFAULT false NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`profile_version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_guests`("id", "name", "email", "about_me", "pronouns", "based_in", "prompts", "languages", "contacts", "email_on_rsvp_change", "email_on_host_change", "email_on_cohost_add", "email_on_proposal_join", "email_on_proposal_comment", "email_on_session_comment", "email_on_profile_comment", "email_on_comment_thread", "email_on_meeting_request", "email_on_meeting_response", "email_on_session_heads_up", "email_on_attendee_count_reminder", "avatar_url", "profile_updated_at", "auth_protected", "password_hash", "username", "password_set_at", "site_admin", "version", "profile_version") SELECT "id", "name", "email", "about_me", "pronouns", "based_in", "prompts", "languages", "contacts", "email_on_rsvp_change", "email_on_host_change", "email_on_cohost_add", "email_on_proposal_join", "email_on_proposal_comment", "email_on_session_comment", "email_on_profile_comment", "email_on_comment_thread", "email_on_meeting_request", "email_on_meeting_response", "email_on_session_heads_up", "email_on_attendee_count_reminder", "avatar_url", "profile_updated_at", "auth_protected", "password_hash", "username", "password_set_at", "site_admin", "version", "profile_version" FROM `guests`;--> statement-breakpoint
DROP TABLE `guests`;--> statement-breakpoint
ALTER TABLE `__new_guests` RENAME TO `guests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
UPDATE `guests` SET `email` = NULL WHERE trim(`email`) = '';--> statement-breakpoint
CREATE UNIQUE INDEX `guests_email_unique` ON `guests` (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX `guests_username_unique` ON `guests` (`username`);