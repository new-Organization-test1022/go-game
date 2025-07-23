CREATE TABLE `game_moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`move_number` integer NOT NULL,
	`player_id` integer,
	`stone_color` text NOT NULL,
	`position_x` integer NOT NULL,
	`position_y` integer NOT NULL,
	`captured_stones` text,
	`time_used` integer DEFAULT 0,
	`remaining_time` integer,
	`board_state_after` text,
	`comment` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`capture_game_wins` integer DEFAULT 0,
	`capture_game_losses` integer DEFAULT 0,
	`standard_game_wins` integer DEFAULT 0,
	`standard_game_losses` integer DEFAULT 0,
	`human_opponent_wins` integer DEFAULT 0,
	`human_opponent_losses` integer DEFAULT 0,
	`ai_opponent_wins` integer DEFAULT 0,
	`ai_opponent_losses` integer DEFAULT 0,
	`total_captured_stones` integer DEFAULT 0,
	`total_lost_stones` integer DEFAULT 0,
	`total_territory` real DEFAULT 0,
	`average_game_duration` integer DEFAULT 0,
	`longest_game` integer DEFAULT 0,
	`shortest_game` integer,
	`highest_rank` integer DEFAULT 1,
	`lowest_rank` integer DEFAULT 1,
	`rank_change_history` text,
	`recent_performance` text,
	`win_streak` integer DEFAULT 0,
	`lose_streak` integer DEFAULT 0,
	`best_win_streak` integer DEFAULT 0,
	`last_game_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `games` ADD `black_captured_stones` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `games` ADD `white_captured_stones` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `games` ADD `black_territory` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `games` ADD `white_territory` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `games` ADD `total_moves` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `games` ADD `end_reason` text;--> statement-breakpoint
ALTER TABLE `games` ADD `capture_limit` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `move_limit` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `game_notes` text;--> statement-breakpoint
ALTER TABLE `games` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `games` ADD `updated_at` integer NOT NULL;