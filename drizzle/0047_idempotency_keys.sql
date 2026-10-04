CREATE TABLE `idempotency_keys` (
	`actor` text NOT NULL,
	`key` text NOT NULL,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`body_hash` text NOT NULL,
	`status` integer,
	`headers` text,
	`body` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`actor`, `key`)
);
--> statement-breakpoint
CREATE INDEX `idempotency_keys_created_at_idx` ON `idempotency_keys` (`created_at`);