ALTER TABLE `user_settings` MODIFY COLUMN `theme` varchar(32) NOT NULL DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE `user_settings` MODIFY COLUMN `share_button_mode` varchar(32) NOT NULL DEFAULT 'clipboard';--> statement-breakpoint
ALTER TABLE `user_settings` MODIFY COLUMN `thumbnail_quality` varchar(32) NOT NULL DEFAULT 'ultra';--> statement-breakpoint
ALTER TABLE `user_settings` ADD `autoplay` int DEFAULT 1 NOT NULL;