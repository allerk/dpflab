CREATE TABLE `delivery_outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` integer,
	`provider` text NOT NULL,
	`event_name` text NOT NULL,
	`dedupe_key` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer NOT NULL,
	`last_attempt_at` integer,
	`sent_at` integer,
	`last_error` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `contact_submissions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `delivery_outbox_provider_dedupe_key_unique` ON `delivery_outbox` (`provider`,`dedupe_key`);--> statement-breakpoint
CREATE INDEX `delivery_outbox_status_next_attempt_at_idx` ON `delivery_outbox` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE INDEX `delivery_outbox_submission_id_idx` ON `delivery_outbox` (`submission_id`);--> statement-breakpoint
CREATE TABLE `lead_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` integer NOT NULL,
	`activity_type` text NOT NULL,
	`actor` text DEFAULT 'system' NOT NULL,
	`from_value` text DEFAULT '' NOT NULL,
	`to_value` text DEFAULT '' NOT NULL,
	`details_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `contact_submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lead_activities_submission_created_at_idx` ON `lead_activities` (`submission_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `lead_activities_type_created_at_idx` ON `lead_activities` (`activity_type`,`created_at`);--> statement-breakpoint
CREATE TABLE `marketing_daily_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`metric_date` text NOT NULL,
	`campaign_id` text DEFAULT '' NOT NULL,
	`campaign_name` text DEFAULT '' NOT NULL,
	`adset_id` text DEFAULT '' NOT NULL,
	`adset_name` text DEFAULT '' NOT NULL,
	`ad_id` text DEFAULT '' NOT NULL,
	`ad_name` text DEFAULT '' NOT NULL,
	`spend_cents` integer DEFAULT 0 NOT NULL,
	`impressions` integer DEFAULT 0 NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`leads` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `marketing_daily_metrics_dimensions_unique` ON `marketing_daily_metrics` (`provider`,`source`,`metric_date`,`campaign_id`,`adset_id`,`ad_id`);--> statement-breakpoint
CREATE INDEX `marketing_daily_metrics_date_provider_idx` ON `marketing_daily_metrics` (`metric_date`,`provider`);--> statement-breakpoint
CREATE INDEX `marketing_daily_metrics_campaign_date_idx` ON `marketing_daily_metrics` (`campaign_id`,`metric_date`);--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `phone_normalized` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `email_normalized` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `origin` text DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `source` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `external_lead_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `external_form_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `gclid` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `gbraid` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `wbraid` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `ga_client_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `ga_session_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `parts_materials_cost_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `labor_cost_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `logistics_cost_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `other_cost_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `next_action_at` integer;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `next_action_note` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `contact_submissions`
SET
	`phone_normalized` = CASE
		WHEN trim(`phone`) = '' THEN ''
		WHEN substr(trim(`phone`), 1, 1) = '+' THEN '+' || replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
		WHEN substr(replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 1, 2) = '00' THEN '+' || substr(replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 3)
		WHEN substr(replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 1, 3) = '372' THEN '+' || replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
		WHEN length(replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')) IN (7, 8) THEN '+372' || replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
		ELSE replace(replace(replace(replace(replace(replace(trim(`phone`), '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
	END,
	`email_normalized` = lower(trim(`email`)),
	`source` = CASE
		WHEN trim(`utm_source`) <> '' THEN trim(`utm_source`)
		WHEN trim(`fbclid`) <> '' OR trim(`fbp`) <> '' OR trim(`fbc`) <> '' THEN 'meta'
		ELSE 'direct'
	END;--> statement-breakpoint
CREATE UNIQUE INDEX `contact_submissions_origin_external_lead_id_unique` ON `contact_submissions` (`origin`,`external_lead_id`) WHERE "contact_submissions"."external_lead_id" <> '';--> statement-breakpoint
CREATE INDEX `contact_submissions_status_created_at_idx` ON `contact_submissions` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `contact_submissions_origin_created_at_idx` ON `contact_submissions` (`origin`,`created_at`);--> statement-breakpoint
CREATE INDEX `contact_submissions_phone_normalized_idx` ON `contact_submissions` (`phone_normalized`);--> statement-breakpoint
CREATE INDEX `contact_submissions_email_normalized_idx` ON `contact_submissions` (`email_normalized`);--> statement-breakpoint
CREATE INDEX `contact_submissions_external_form_id_idx` ON `contact_submissions` (`external_form_id`);--> statement-breakpoint
CREATE INDEX `contact_submissions_next_action_at_idx` ON `contact_submissions` (`next_action_at`);--> statement-breakpoint
CREATE INDEX `contact_submissions_campaign_created_at_idx` ON `contact_submissions` (`campaign_id`,`created_at`);
