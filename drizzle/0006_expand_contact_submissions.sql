ALTER TABLE `contact_submissions` ADD `client_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `service_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `filter_state` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `vehicle` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `symptoms` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `urgency` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `preferred_contact` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `utm_source` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `utm_medium` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `utm_campaign` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `utm_content` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `utm_term` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `fbclid` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `landing_page` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `referrer` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `privacy_version` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `analytics_consent` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `faq`
SET
  `question` = json_set(
    `question`,
    '$.en',
    CASE `sort_order`
      WHEN 1 THEN 'How long does the cleaning take?'
      WHEN 2 THEN 'Do you collect and return DPF filters?'
      WHEN 3 THEN 'Does the service work for all vehicle makes?'
      WHEN 4 THEN 'What is included in the price?'
      WHEN 5 THEN 'Do you provide a guarantee?'
      ELSE json_extract(`question`, '$.et')
    END
  ),
  `answer` = json_set(
    `answer`,
    '$.en',
    CASE `sort_order`
      WHEN 1 THEN 'A cleaning cycle usually takes 1–2.5 hours depending on the filter type and condition.'
      WHEN 2 THEN 'Yes. We can collect and return a DPF filter, usually on the same day. The maximum turnaround from collection to return is 24 hours.'
      WHEN 3 THEN 'Yes. We work with DPF and FAP filters for passenger cars and commercial vehicles.'
      WHEN 4 THEN 'Diagnostics, deep hydrodynamic cleaning, a flow test and a completed-service report.'
      WHEN 5 THEN 'Yes. We guarantee the cleaning result and can restore up to 98% of the filter flow.'
      ELSE json_extract(`answer`, '$.et')
    END
  );--> statement-breakpoint
UPDATE `pricing`
SET
  `title` = json_set(
    `title`,
    '$.en',
    CASE `sort_order`
      WHEN 1 THEN 'DPF filter cleaning'
      WHEN 2 THEN 'Commercial vehicle DPF cleaning'
      ELSE json_extract(`title`, '$.et')
    END
  ),
  `cta` = json_set(`cta`, '$.en', 'Request service');
