CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player1_id` integer NOT NULL,
	`player2_id` integer NOT NULL,
	`board_size` integer NOT NULL,
	`rule_type` text NOT NULL,
	`winner_id` integer,
	`duration` integer DEFAULT 0 NOT NULL,
	`date_time` integer NOT NULL,
	`record` text,
	`status` text DEFAULT 'ongoing' NOT NULL,
	`black_score` real DEFAULT 0,
	`white_score` real DEFAULT 0,
	FOREIGN KEY (`player1_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`win_count` integer DEFAULT 0 NOT NULL,
	`lose_count` integer DEFAULT 0 NOT NULL,
	`total_time` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_nickname_unique` ON `players` (`nickname`);