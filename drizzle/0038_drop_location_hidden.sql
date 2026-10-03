DELETE FROM `event_locations` WHERE `location_id` IN (SELECT `id` FROM `locations` WHERE `hidden` = 1);--> statement-breakpoint
ALTER TABLE `locations` DROP COLUMN `hidden`;
