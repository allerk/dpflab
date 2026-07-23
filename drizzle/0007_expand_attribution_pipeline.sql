ALTER TABLE `contact_submissions` ADD `utm_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `campaign_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `adset_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `ad_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `fbp` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `fbc` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `status` text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `assigned_to` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `order_amount_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `loss_reason` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `admin_notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `first_contacted_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `qualified_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `booked_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `completed_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `lost_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `updated_at` integer;
