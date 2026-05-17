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

export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  comment: text('comment').notNull().default(''),
  locale: text('locale').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
