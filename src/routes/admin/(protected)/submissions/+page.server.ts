import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  calculateSubmissionFinancials,
  deleteContactSubmission,
  getContactSubmissions,
  getContactSubmissionsForPeriod
} from '$lib/db/repositories/contact-submissions.js';
import {
  getMarketingDailyMetrics,
  getMarketingMetricTotals,
  upsertMarketingDailyMetrics
} from '$lib/db/repositories/marketing-daily-metrics.js';
import { fetchMetaDailyMetrics } from '$lib/server/integrations/meta-ads-insights.js';
import { processCrmOutbox } from '$lib/server/crm/outbox.js';
import { isMetaAttributedLead, isPaidMetaLead } from '$lib/server/crm/reporting.js';

const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const beginningOfPeriod = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 29);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const periodStart = beginningOfPeriod();
  const periodEnd = new Date();
  const [rows, reportRowsWithSentinel] = await Promise.all([
    getContactSubmissions(db),
    getContactSubmissionsForPeriod(db, { from: periodStart, to: periodEnd, limit: 5_001 })
  ]);
  const reportTruncated = reportRowsWithSentinel.length > 5_000;
  const periodRows = reportRowsWithSentinel.slice(0, 5_000);
  let marketing = {
    available: true,
    currency: 'EUR',
    mixedCurrency: false,
    spendCents: 0,
    impressions: 0,
    clicks: 0,
    leads: 0,
    costPerLeadCents: null as number | null
  };
  let metricRows: Awaited<ReturnType<typeof getMarketingDailyMetrics>> = [];
  try {
    const filters = {
      dateFrom: dateKey(periodStart),
      dateTo: dateKey(periodEnd),
      provider: 'meta'
    };
    const [totals, daily] = await Promise.all([
      getMarketingMetricTotals(db, filters),
      getMarketingDailyMetrics(db, filters)
    ]);
    const currencies = [...new Set(daily.map((metric) => metric.currency || 'EUR'))];
    marketing = {
      available: true,
      currency: currencies[0] || 'EUR',
      mixedCurrency: currencies.length > 1,
      ...totals
    };
    metricRows = daily;
  } catch {
    // CRM remains usable while a just-deployed migration is still being applied.
    marketing.available = false;
  }

  const metaRows = periodRows.filter(isMetaAttributedLead);
  const paidMetaRows = metaRows.filter(isPaidMetaLead);
  const unattributedMetaRows = metaRows.filter((row) => !isPaidMetaLead(row));
  const completedMetaRows = paidMetaRows.filter((row) => row.status === 'completed');
  const actual = completedMetaRows.reduce(
    (totals, row) => {
      const financials = calculateSubmissionFinancials(row);
      totals.revenueCents += financials.revenueCents;
      totals.directCostCents += financials.totalCostCents;
      totals.grossProfitCents += financials.grossProfitCents;
      return totals;
    },
    { revenueCents: 0, directCostCents: 0, grossProfitCents: 0 }
  );
  const campaignMap = new Map<string, {
    campaignId: string;
    campaignName: string;
    currency: string;
    spendCents: number;
    impressions: number;
    clicks: number;
    providerLeads: number;
  }>();
  for (const metric of metricRows) {
    const key = `${metric.currency || 'EUR'}:${metric.campaignId || metric.campaignName || 'unknown'}`;
    const item = campaignMap.get(key) ?? {
      campaignId: metric.campaignId,
      campaignName: metric.campaignName || 'Без названия',
      currency: metric.currency || 'EUR',
      spendCents: 0,
      impressions: 0,
      clicks: 0,
      providerLeads: 0
    };
    item.spendCents += metric.spendCents;
    item.impressions += metric.impressions;
    item.clicks += metric.clicks;
    item.providerLeads += metric.leads;
    campaignMap.set(key, item);
  }
  const campaigns = [...campaignMap.values()]
    .map((campaign) => {
      const crmRows = paidMetaRows.filter((row) =>
        campaign.campaignId
          ? row.campaignId === campaign.campaignId
          : row.utmCampaign === campaign.campaignName
      );
      const completed = crmRows.filter((row) => row.status === 'completed');
      const financials = completed.reduce(
        (sum, row) => {
          const values = calculateSubmissionFinancials(row);
          sum.revenueCents += values.revenueCents;
          sum.grossProfitCents += values.grossProfitCents;
          return sum;
        },
        { revenueCents: 0, grossProfitCents: 0 }
      );
      return {
        ...campaign,
        crmLeads: crmRows.length,
        completed: completed.length,
        ...financials,
        cplCents:
          campaign.providerLeads > 0
            ? Math.round(campaign.spendCents / campaign.providerLeads)
            : null
      };
    })
    .sort((a, b) => b.spendCents - a.spendCents)
    .slice(0, 12);

  const env = event.platform?.env;
  return {
    rows,
    report: {
      periodFrom: dateKey(periodStart),
      periodTo: dateKey(periodEnd),
      reportTruncated,
      marketing,
      metaLeadCount: paidMetaRows.length,
      metaUnattributedCount: unattributedMetaRows.length,
      metaCompletedCount: completedMetaRows.length,
      campaigns,
      ...actual
    },
    integrations: {
      metaLeadImport: Boolean(
        env?.META_APP_SECRET &&
          env.META_LEADS_ACCESS_TOKEN &&
          env.META_LEADS_VERIFY_TOKEN &&
          env.META_LEADS_PAGE_ID
      ),
      metaSpend: Boolean(env?.META_AD_ACCOUNT_ID && env.META_MARKETING_ACCESS_TOKEN),
      metaWebsiteEvents: Boolean(
        env?.META_PIXEL_ID && env.META_CAPI_TOKEN && env.META_SITE_CRM_EVENTS_ENABLED === 'true'
      ),
      metaCrmFeedback: Boolean(
        env?.META_PIXEL_ID && env.META_CAPI_TOKEN && env.META_CRM_EVENTS_ENABLED === 'true'
      ),
      googleEvents: Boolean(
        env?.GOOGLE_ANALYTICS_MEASUREMENT_ID &&
          env.GOOGLE_ANALYTICS_API_SECRET &&
          env.GOOGLE_CRM_EVENTS_ENABLED === 'true'
      )
    }
  };
};

export const actions: Actions = {
  retryDeliveries: async (event) => {
    requireAdmin(event);
    const db = getDb(event.platform);
    const stats = await processCrmOutbox(db, event.platform?.env ?? {}, { limit: 50 });
    console.info(
      `[admin] action=retry domain=crm-outbox delivered=${stats.delivered} deferred=${stats.deferred} failed=${stats.failed} skipped=${stats.skipped}`
    );
    redirect(
      303,
      `/admin/submissions?deliveries=${stats.delivered}-${stats.deferred}-${stats.failed}-${stats.skipped}`
    );
  },
  syncMarketing: async (event) => {
    requireAdmin(event);
    const db = getDb(event.platform);
    const env = event.platform?.env;
    if (!env?.META_AD_ACCOUNT_ID || !env.META_MARKETING_ACCESS_TOKEN) {
      return fail(503, { syncError: 'Подключение Meta Ads ещё не настроено' });
    }

    const until = new Date();
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 34);
    try {
      const metrics = await fetchMetaDailyMetrics(env, {
        since: dateKey(since),
        until: dateKey(until)
      });
      await upsertMarketingDailyMetrics(
        db,
        metrics.map((metric) => ({
          provider: metric.provider,
          source: 'meta_ads',
          currency: metric.currency,
          metricDate: metric.date,
          campaignId: metric.campaignId,
          campaignName: metric.campaignName,
          adsetId: metric.adsetId,
          adsetName: metric.adsetName,
          adId: metric.adId,
          adName: metric.adName,
          spendCents: metric.spendCents,
          impressions: metric.impressions,
          clicks: metric.clicks,
          leads: metric.providerLeads
        }))
      );
      console.info(`[admin] action=sync domain=meta-marketing rows=${metrics.length}`);
      redirect(303, `/admin/submissions?marketing_synced=${metrics.length}`);
    } catch {
      return fail(502, { syncError: 'Meta не отдала статистику. Проверьте токен и права insights.' });
    }
  },
  delete: async (event) => {
    requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await deleteContactSubmission(db, id);
    console.info(`[admin] action=delete domain=submissions id=${id}`);
    redirect(303, '/admin/submissions');
  }
};
