CREATE TABLE `video_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_id` varchar(64) NOT NULL,
	`current_time` int NOT NULL DEFAULT 0,
	`duration` int NOT NULL DEFAULT 0,
	`last_updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_progress_id` PRIMARY KEY(`id`)
);
