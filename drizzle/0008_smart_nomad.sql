CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'ja',
	`theme` enum('light','dark') NOT NULL DEFAULT 'dark',
	`share_button_mode` enum('clipboard','dialog') NOT NULL DEFAULT 'clipboard',
	`thumbnail_quality` enum('low','medium','high','ultra','maximum') NOT NULL DEFAULT 'high',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
