CREATE TABLE `payment_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`stripe_payment_intent_id` varchar(255) NOT NULL,
	`amount_cents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`status` varchar(50) NOT NULL DEFAULT 'succeeded',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_history_id` PRIMARY KEY(`id`)
);
