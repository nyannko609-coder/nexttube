CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key_number` int NOT NULL,
	`key_value` text NOT NULL,
	`is_active` int NOT NULL DEFAULT 1,
	`quota_used` int NOT NULL DEFAULT 0,
	`quota_limit` int NOT NULL DEFAULT 10000,
	`last_reset_at` timestamp NOT NULL DEFAULT (now()),
	`error_count` int NOT NULL DEFAULT 0,
	`last_error_at` timestamp,
	`last_error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_number_unique` UNIQUE(`key_number`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_id` varchar(64) NOT NULL,
	`video_title` text,
	`channel_id` varchar(64),
	`channel_title` varchar(255),
	`thumbnail_url` varchar(512),
	`added_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlist_id` int NOT NULL,
	`video_id` varchar(64) NOT NULL,
	`video_title` text,
	`channel_id` varchar(64),
	`channel_title` varchar(255),
	`thumbnail_url` varchar(512),
	`position` int NOT NULL,
	`added_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`thumbnail_url` varchar(512),
	`is_public` int NOT NULL DEFAULT 0,
	`item_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`bio` text,
	`avatar_url` varchar(512),
	`banner_url` varchar(512),
	`subscriber_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `video_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` varchar(64) NOT NULL,
	`title` text,
	`description` text,
	`channel_id` varchar(64),
	`channel_title` varchar(255),
	`published_at` timestamp,
	`thumbnail_url` varchar(512),
	`view_count` int NOT NULL DEFAULT 0,
	`like_count` int NOT NULL DEFAULT 0,
	`comment_count` int NOT NULL DEFAULT 0,
	`duration` varchar(32),
	`cache_expired_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `video_cache_video_id_unique` UNIQUE(`video_id`)
);
--> statement-breakpoint
CREATE TABLE `watch_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_id` varchar(64) NOT NULL,
	`video_title` text,
	`channel_id` varchar(64),
	`channel_title` varchar(255),
	`thumbnail_url` varchar(512),
	`watched_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watch_history_id` PRIMARY KEY(`id`)
);
