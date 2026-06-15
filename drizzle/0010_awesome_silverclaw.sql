ALTER TABLE `users` ADD `stripe_customer_id` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_payment_intent_id` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `has_paid` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `paid_at` timestamp;