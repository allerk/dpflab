CREATE TABLE `business_expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expense_date` text NOT NULL,
	`category` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`vendor` text DEFAULT '' NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `business_expenses_date_idx` ON `business_expenses` (`expense_date`);--> statement-breakpoint
CREATE INDEX `business_expenses_category_date_idx` ON `business_expenses` (`category`,`expense_date`);--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `registration_number` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `part_number` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `diagnostic_code` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `pressure_before_mbar` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `pressure_after_mbar` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `partner_workshop` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `partner_contact` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `partner_customer_price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `partner_payment_model` text DEFAULT 'not_applicable' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `pickup_address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `loss_reason_code` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `diagnostics_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `partner_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `quote_confirmed_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `received_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `cleaning_started_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `ready_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `follow_up_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `spam_at` integer;--> statement-breakpoint
UPDATE `contact_submissions`
SET `completed_at` = COALESCE(`updated_at`, `created_at`)
WHERE `status` = 'completed' AND `completed_at` IS NULL;--> statement-breakpoint
CREATE INDEX `contact_submissions_completed_at_idx` ON `contact_submissions` (`completed_at`);
