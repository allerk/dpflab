DROP TABLE `contacts`;--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`phone_href` text NOT NULL,
	`whatsapp` text NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`weekdays_open` text NOT NULL,
	`weekdays_close` text NOT NULL,
	`saturday_open` text,
	`saturday_close` text
);--> statement-breakpoint
ALTER TABLE `certificates` DROP COLUMN `locale`;--> statement-breakpoint
ALTER TABLE `faq` DROP COLUMN `locale`;--> statement-breakpoint
ALTER TABLE `pricing` DROP COLUMN `locale`;--> statement-breakpoint
ALTER TABLE `reviews` DROP COLUMN `locale`;
