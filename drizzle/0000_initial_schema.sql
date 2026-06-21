CREATE TABLE `certificates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`text` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`locale` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`phone` text NOT NULL,
	`phone_href` text NOT NULL,
	`whatsapp` text NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`hours_week` text NOT NULL,
	`hours_sat` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faq` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pricing` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`icon` text NOT NULL,
	`title` text NOT NULL,
	`price` text NOT NULL,
	`cta` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`stars` integer DEFAULT 5 NOT NULL,
	`text` text NOT NULL,
	`author` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
