CREATE TABLE `scholar_accounts` (
	`scholar_id` text PRIMARY KEY NOT NULL,
	`display_id` text NOT NULL,
	`access_cipher_hash` text NOT NULL,
	`access_cipher_salt` text NOT NULL,
	`cipher_iterations` integer DEFAULT 180000 NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scholar_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`scholar_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`scholar_id`) REFERENCES `scholar_accounts`(`scholar_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_scholar_sessions_scholar_id` ON `scholar_sessions` (`scholar_id`);--> statement-breakpoint
CREATE INDEX `idx_scholar_sessions_expires_at` ON `scholar_sessions` (`expires_at`);--> statement-breakpoint
PRAGMA optimize;
