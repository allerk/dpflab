import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

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
      };
    }
  }
}

export {};
