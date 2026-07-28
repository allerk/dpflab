import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().default(''),
  comment: text('comment').notNull().default(''),
  clientType: text('client_type').notNull().default(''),
  serviceType: text('service_type').notNull().default(''),
  filterState: text('filter_state').notNull().default(''),
  vehicle: text('vehicle').notNull().default(''),
  symptoms: text('symptoms').notNull().default(''),
  urgency: text('urgency').notNull().default(''),
  preferredContact: text('preferred_contact').notNull().default(''),
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
  landingPage: text('landing_page').notNull().default(''),
  referrer: text('referrer').notNull().default(''),
  privacyVersion: text('privacy_version').notNull().default(''),
  analyticsConsent: integer('analytics_consent', { mode: 'boolean' }).notNull().default(false),
  status: text('status', {
    enum: ['new', 'contacted', 'qualified', 'booked', 'completed', 'lost']
  }).notNull().default('new'),
  assignedTo: text('assigned_to').notNull().default(''),
  orderAmountCents: integer('order_amount_cents').notNull().default(0),
  lossReason: text('loss_reason').notNull().default(''),
  adminNotes: text('admin_notes').notNull().default(''),
  firstContactedAt: integer('first_contacted_at', { mode: 'timestamp' }),
  qualifiedAt: integer('qualified_at', { mode: 'timestamp' }),
  bookedAt: integer('booked_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  lostAt: integer('lost_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  locale: text('locale').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
