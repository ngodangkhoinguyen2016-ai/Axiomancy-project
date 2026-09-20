CREATE TABLE `pvp_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host_id` text NOT NULL,
	`host_name` text NOT NULL,
	`host_deck` text NOT NULL,
	`guest_id` text,
	`guest_name` text,
	`guest_deck` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `player_profiles` ADD `play_seconds` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `player_profiles` ADD `chapters_cleared` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `player_profiles` ADD `pvp_wins` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `player_profiles` ADD `pvp_rating` integer DEFAULT 1000 NOT NULL;