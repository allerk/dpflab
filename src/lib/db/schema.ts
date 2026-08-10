import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const faq = sqliteTable('faq', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stars: integer('stars').notNull().default(5),
  text: text('text').notNull(),
  author: text('author').notNull(),
  locale: text('locale').notNull().default('ru'),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const pricing = sqliteTable('pricing', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  price: text('price').notNull(),
  cta: text('cta').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const certificates = sqliteTable('certificates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  text: text('text').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').notNull(),
  phoneHref: text('phone_href').notNull(),
  whatsapp: text('whatsapp').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  weekdaysOpen: text('weekdays_open').notNull(),
  weekdaysClose: text('weekdays_close').notNull(),
  saturdayOpen: text('saturday_open'),
  saturdayClose: text('saturday_close')
});

export const beforeAfter = sqliteTable('before_after', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sliderEnabled: integer('slider_enabled', { mode: 'boolean' }).notNull().default(true),
  imageBefore: text('image_before'),
  imageAfter: text('image_after'),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const siteImages = sqliteTable('site_images', {
  key: text('key').primaryKey(),
  filename: text('filename')
});

export const contactSubmissions = sqliteTable(
  'contact_submissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull().default(''),
    phoneNormalized: text('phone_normalized').notNull().default(''),
    emailNormalized: text('email_normalized').notNull().default(''),
    comment: text('comment').notNull().default(''),
    clientType: text('client_type').notNull().default(''),
    serviceType: text('service_type').notNull().default(''),
    filterState: text('filter_state').notNull().default(''),
    vehicle: text('vehicle').notNull().default(''),
    symptoms: text('symptoms').notNull().default(''),
    urgency: text('urgency').notNull().default(''),
    preferredContact: text('preferred_contact').notNull().default(''),
    origin: text('origin', {
      enum: ['site', 'meta_instant', 'whatsapp', 'manual']
    }).notNull().default('site'),
    source: text('source').notNull().default(''),
    externalLeadId: text('external_lead_id').notNull().default(''),
    externalFormId: text('external_form_id').notNull().default(''),
    utmSource: text('utm_source').notNull().default(''),
    utmMedium: text('utm_medium').notNull().default(''),
    utmCampaign: text('utm_campaign').notNull().default(''),
    utmContent: text('utm_content').notNull().default(''),
    utmTerm: text('utm_term').notNull().default(''),
    utmId: text('utm_id').notNull().default(''),
    campaignId: text('campaign_id').notNull().default(''),
    adsetId: text('adset_id').notNull().default(''),
    adId: text('ad_id').notNull().default(''),
    fbclid: text('fbclid').notNull().default(''),
    fbp: text('fbp').notNull().default(''),
    fbc: text('fbc').notNull().default(''),
    gclid: text('gclid').notNull().default(''),
    gbraid: text('gbraid').notNull().default(''),
    wbraid: text('wbraid').notNull().default(''),
    gaClientId: text('ga_client_id').notNull().default(''),
    gaSessionId: text('ga_session_id').notNull().default(''),
    landingPage: text('landing_page').notNull().default(''),
    referrer: text('referrer').notNull().default(''),
    privacyVersion: text('privacy_version').notNull().default(''),
    analyticsConsent: integer('analytics_consent', { mode: 'boolean' }).notNull().default(false),
    status: text('status', {
      enum: ['new', 'contacted', 'qualified', 'booked', 'completed', 'lost']
    }).notNull().default('new'),
    assignedTo: text('assigned_to').notNull().default(''),
    orderAmountCents: integer('order_amount_cents').notNull().default(0),
    partsMaterialsCostCents: integer('parts_materials_cost_cents').notNull().default(0),
    laborCostCents: integer('labor_cost_cents').notNull().default(0),
    logisticsCostCents: integer('logistics_cost_cents').notNull().default(0),
    otherCostCents: integer('other_cost_cents').notNull().default(0),
    lossReason: text('loss_reason').notNull().default(''),
    adminNotes: text('admin_notes').notNull().default(''),
    nextActionAt: integer('next_action_at', { mode: 'timestamp' }),
    nextActionNote: text('next_action_note').notNull().default(''),
    firstContactedAt: integer('first_contacted_at', { mode: 'timestamp' }),
    qualifiedAt: integer('qualified_at', { mode: 'timestamp' }),
    bookedAt: integer('booked_at', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    lostAt: integer('lost_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    locale: text('locale').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    uniqueIndex('contact_submissions_origin_external_lead_id_unique')
      .on(table.origin, table.externalLeadId)
      .where(sql`${table.externalLeadId} <> ''`),
    index('contact_submissions_status_created_at_idx').on(table.status, table.createdAt),
    index('contact_submissions_origin_created_at_idx').on(table.origin, table.createdAt),
    index('contact_submissions_phone_normalized_idx').on(table.phoneNormalized),
    index('contact_submissions_email_normalized_idx').on(table.emailNormalized),
    index('contact_submissions_external_form_id_idx').on(table.externalFormId),
    index('contact_submissions_next_action_at_idx').on(table.nextActionAt),
    index('contact_submissions_campaign_created_at_idx').on(table.campaignId, table.createdAt)
  ]
);

export const leadActivities = sqliteTable(
  'lead_activities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    submissionId: integer('submission_id')
      .notNull()
      .references(() => contactSubmissions.id, { onDelete: 'cascade' }),
    activityType: text('activity_type').notNull(),
    actor: text('actor').notNull().default('system'),
    fromValue: text('from_value').notNull().default(''),
    toValue: text('to_value').notNull().default(''),
    detailsJson: text('details_json').notNull().default('{}'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    index('lead_activities_submission_created_at_idx').on(table.submissionId, table.createdAt),
    index('lead_activities_type_created_at_idx').on(table.activityType, table.createdAt)
  ]
);

export const deliveryOutbox = sqliteTable(
  'delivery_outbox',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    submissionId: integer('submission_id').references(() => contactSubmissions.id, {
      onDelete: 'set null'
    }),
    provider: text('provider', { enum: ['meta', 'google'] }).notNull(),
    eventName: text('event_name').notNull(),
    dedupeKey: text('dedupe_key').notNull(),
    payloadJson: text('payload_json').notNull(),
    status: text('status', {
      enum: ['pending', 'processing', 'sent', 'failed', 'dead', 'skipped']
    }).notNull().default('pending'),
    attemptCount: integer('attempt_count').notNull().default(0),
    nextAttemptAt: integer('next_attempt_at', { mode: 'timestamp' }).notNull(),
    lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp' }),
    sentAt: integer('sent_at', { mode: 'timestamp' }),
    lastError: text('last_error').notNull().default(''),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    uniqueIndex('delivery_outbox_provider_dedupe_key_unique').on(table.provider, table.dedupeKey),
    index('delivery_outbox_status_next_attempt_at_idx').on(table.status, table.nextAttemptAt),
    index('delivery_outbox_submission_id_idx').on(table.submissionId)
  ]
);

export const marketingDailyMetrics = sqliteTable(
  'marketing_daily_metrics',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    provider: text('provider').notNull(),
    source: text('source').notNull().default(''),
    currency: text('currency').notNull().default('EUR'),
    metricDate: text('metric_date').notNull(),
    campaignId: text('campaign_id').notNull().default(''),
    campaignName: text('campaign_name').notNull().default(''),
    adsetId: text('adset_id').notNull().default(''),
    adsetName: text('adset_name').notNull().default(''),
    adId: text('ad_id').notNull().default(''),
    adName: text('ad_name').notNull().default(''),
    spendCents: integer('spend_cents').notNull().default(0),
    impressions: integer('impressions').notNull().default(0),
    clicks: integer('clicks').notNull().default(0),
    leads: integer('leads').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    uniqueIndex('marketing_daily_metrics_dimensions_unique').on(
      table.provider,
      table.source,
      table.metricDate,
      table.campaignId,
      table.adsetId,
      table.adId
    ),
    index('marketing_daily_metrics_date_provider_idx').on(table.metricDate, table.provider),
    index('marketing_daily_metrics_campaign_date_idx').on(table.campaignId, table.metricDate)
  ]
);
