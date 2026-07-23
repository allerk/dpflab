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
        META_PIXEL_ID?: string;
      } & ContactSubmissionNotificationEnv;
      context?: ExecutionContext;
    }
  }
}

export {};
