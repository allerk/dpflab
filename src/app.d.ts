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
      } & ContactSubmissionNotificationEnv;
      context?: ExecutionContext;
    }
  }
}

export {};
