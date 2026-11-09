CREATE TABLE `session_marks` (
	`guest_id` text NOT NULL,
	`session_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`guest_id`, `session_id`),
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
