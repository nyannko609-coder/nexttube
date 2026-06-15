ALTER TABLE `users` ADD `total_donation_amount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `first_donation_at` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `last_donation_at` timestamp;