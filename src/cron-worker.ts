import type { ExportedHandler, Fetcher, ScheduledController, ExecutionContext } from '@cloudflare/workers-types';

type CronEnv = {
  CRM_SERVICE: Fetcher;
  CRM_CRON_TOKEN?: string;
};

const worker: ExportedHandler<CronEnv> = {
  async scheduled(_controller: ScheduledController, env: CronEnv, context: ExecutionContext) {
    const token = env.CRM_CRON_TOKEN?.trim() ?? '';
    if (token.length < 32) throw new Error('CRM_CRON_TOKEN is not configured');
    const task = env.CRM_SERVICE.fetch('https://crm.internal/api/internal/crm-outbox', {
      method: 'POST',
      headers: { 'x-crm-cron-token': token }
    }).then((response) => {
      if (!response.ok) throw new Error(`CRM outbox drain failed status=${response.status}`);
    });
    context.waitUntil(task);
  }
};

export default worker;
