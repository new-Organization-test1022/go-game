PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player1_id` integer NOT NULL,
	`player2_id` integer,
	`board_size` integer NOT NULL,
	`rule_type` text NOT NULL,
	`winner_id` integer,
	`duration` integer DEFAULT 0 NOT NULL,
	`date_time` integer NOT NULL,
	`record` text,
	`status` text DEFAULT 'ongoing' NOT NULL,
	`black_score` real DEFAULT 0,
	`white_score` real DEFAULT 0,
	`game_type` text DEFAULT 'human_vs_human' NOT NULL,
	`ai_difficulty` text,
	`player1_rank_before` integer,
	`player1_rank_after` integer,
	`player2_rank_before` integer,
	`player2_rank_after` integer,
	FOREIGN KEY (`player1_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_games`("id", "player1_id", "player2_id", "board_size", "rule_type", "winner_id", "duration", "date_time", "record", "status", "black_score", "white_score", "game_type", "ai_difficulty", "player1_rank_before", "player1_rank_after", "player2_rank_before", "player2_rank_after") SELECT "id", "player1_id", "player2_id", "board_size", "rule_type", "winner_id", "duration", "date_time", "record", "status", "black_score", "white_score", 'human_vs_human', NULL, NULL, NULL, NULL, NULL FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `players` ADD `rank` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `consecutive_wins` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `consecutive_losses` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `total_games` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `last_rank_update` integer;