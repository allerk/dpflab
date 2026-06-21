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
        ADMIN_PASSWORD?: string;
        ADMIN_SESSION_SECRET?: string;
        ADMIN_WHITELIST?: string;
      };
    }
  }
}

export {};
