CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`thumbnail_quality` varchar(32) NOT NULL DEFAULT 'ultra',
	`language` varchar(10) NOT NULL DEFAULT 'ja',
	`theme` varchar(32) NOT NULL DEFAULT 'dark',
	`autoplay` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
