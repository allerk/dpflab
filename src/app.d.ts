import type { D1Database, R2Bucket, ExecutionContext } from '@cloudflare/workers-types';
import type { ContactSubmissionNotificationEnv } from '$lib/server/notifications/contact-submission';

declare global {
  namespace App {
    interface Locals {
      locale: string;
      admin?: { email: string };
    }
    interface Platform {
      env?: {
        DB: D1Database;
        BUCKET: R2Bucket;
        CF_ACCESS_TEAM_DOMAIN?: string;
        CF_ACCESS_AUD?: string;
        DEV_ADMIN_EMAIL?: string;
        APP_ENV?: 'local' | 'develop' | 'prod';
        META_PIXEL_ID?: string;
        META_CAPI_TOKEN?: string;
        META_GRAPH_API_VERSION?: string;
        META_TEST_EVENT_CODE?: string;
        META_CRM_EVENTS_ENABLED?: string;
        META_SITE_CRM_EVENTS_ENABLED?: string;
        META_APP_SECRET?: string;
        META_LEADS_ACCESS_TOKEN?: string;
        META_LEADS_VERIFY_TOKEN?: string;
        META_LEADS_PAGE_ID?: string;
        META_LEADS_FORM_LOCALES?: string;
        META_AD_ACCOUNT_ID?: string;
        META_MARKETING_ACCESS_TOKEN?: string;
        GOOGLE_ANALYTICS_MEASUREMENT_ID?: string;
        GOOGLE_ANALYTICS_API_SECRET?: string;
        GOOGLE_ANALYTICS_PSEUDONYM_KEY?: string;
        GOOGLE_ANALYTICS_REGION?: string;
        GOOGLE_CRM_EVENTS_ENABLED?: string;
        CRM_CRON_TOKEN?: string;
      } & ContactSubmissionNotificationEnv;
      context?: ExecutionContext;
    }
  }
}

export {};
