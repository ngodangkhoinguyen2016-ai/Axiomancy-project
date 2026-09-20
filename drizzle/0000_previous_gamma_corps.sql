CREATE TABLE `player_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`display_name` text,
	`state_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
