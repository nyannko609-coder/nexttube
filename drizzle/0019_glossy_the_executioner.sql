CREATE TABLE `video_watch_time` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_id` varchar(64) NOT NULL,
	`watched_minutes` int NOT NULL DEFAULT 0,
	`total_duration_minutes` int,
	`last_watched_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_watch_time_id` PRIMARY KEY(`id`)
);
