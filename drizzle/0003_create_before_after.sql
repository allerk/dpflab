CREATE TABLE `before_after` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slider_enabled` integer DEFAULT true NOT NULL,
	`image_before` text,
	`image_after` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
