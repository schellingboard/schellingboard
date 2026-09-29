-- Sessions used to be stored from their slot's start, with every screen adding
-- the event's break; store the start attendees saw instead. Blockers were
-- always shown filling their slot, so they keep theirs.
UPDATE `sessions`
SET `start_time` = strftime(
	'%Y-%m-%dT%H:%M:%fZ',
	`start_time`,
	'+' || (SELECT `break_minutes` FROM `events` WHERE `events`.`id` = `sessions`.`event_id`) || ' minutes'
)
WHERE `start_time` IS NOT NULL
	AND `blocker` = 0
	AND (SELECT `break_minutes` FROM `events` WHERE `events`.`id` = `sessions`.`event_id`) > 0;
