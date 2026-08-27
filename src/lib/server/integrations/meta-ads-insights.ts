export type MetaAdsInsightsEnv = {
  META_AD_ACCOUNT_ID?: string;
  META_MARKETING_ACCESS_TOKEN?: string;
  META_GRAPH_API_VERSION?: string;
};

export type MarketingDailyMetricInput = {
  provider: 'meta';
  date: string;
  currency: string;
  campaignId: string;
  campaignName: string;
  adsetId: string;
  adsetName: string;
  adId: string;
  adName: string;
  spendCents: number;
  impressions: number;
  clicks: number;
  providerLeads: number;
};

type MetaAction = { action_type?: string; value?: string };

type MetaInsightRow = {
  date_start?: string;
  account_currency?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: MetaAction[];
};

const LEAD_ACTIONS = new Set([
  'lead',
  'onsite_conversion.lead_grouped',
  'onsite_conversion.leadgen_grouped',
  'offsite_conversion.fb_pixel_lead'
]);

const asNonNegativeNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const graphVersion = (value: string | undefined) =>
  /^v\d+\.\d+$/.test(value ?? '') ? value! : 'v25.0';

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const leadCount = (actions: MetaAction[] | undefined) =>
  (actions ?? []).reduce(
    (sum, action) => sum + (LEAD_ACTIONS.has(action.action_type ?? '') ? asNonNegativeNumber(action.value) : 0),
    0
  );

const toMetric = (row: MetaInsightRow): MarketingDailyMetricInput | null => {
  if (!row.date_start || !isDate(row.date_start)) return null;
  return {
    provider: 'meta',
    date: row.date_start,
    currency: (row.account_currency || 'EUR').slice(0, 8),
    campaignId: (row.campaign_id || '').slice(0, 120),
    campaignName: (row.campaign_name || '').slice(0, 240),
    adsetId: (row.adset_id || '').slice(0, 120),
    adsetName: (row.adset_name || '').slice(0, 240),
    adId: (row.ad_id || '').slice(0, 120),
    adName: (row.ad_name || '').slice(0, 240),
    spendCents: Math.round(asNonNegativeNumber(row.spend) * 100),
    impressions: Math.round(asNonNegativeNumber(row.impressions)),
    clicks: Math.round(asNonNegativeNumber(row.clicks)),
    providerLeads: Math.round(leadCount(row.actions))
  };
};

export class MetaAdsInsightsError extends Error {
  constructor(public readonly status: number) {
    super(`Meta Ads insights request failed with status ${status}`);
    this.name = 'MetaAdsInsightsError';
  }
}

export async function fetchMetaDailyMetrics(
  env: MetaAdsInsightsEnv,
  range: { since: string; until: string },
  fetchFn: typeof fetch = fetch
): Promise<MarketingDailyMetricInput[]> {
  const accountId = env.META_AD_ACCOUNT_ID?.trim() ?? '';
  const token = env.META_MARKETING_ACCESS_TOKEN?.trim() ?? '';
  if (!/^act_\d+$/.test(accountId) || !token || !isDate(range.since) || !isDate(range.until)) {
    return [];
  }

  let next: URL | null = new URL(
    `https://graph.facebook.com/${graphVersion(env.META_GRAPH_API_VERSION)}/${accountId}/insights`
  );
  next.searchParams.set('level', 'ad');
  next.searchParams.set('time_increment', '1');
  next.searchParams.set('time_range', JSON.stringify(range));
  next.searchParams.set(
    'fields',
    [
      'date_start',
      'account_currency',
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'ad_id',
      'ad_name',
      'spend',
      'impressions',
      'clicks',
      'actions'
    ].join(',')
  );
  next.searchParams.set('limit', '500');

  const metrics: MarketingDailyMetricInput[] = [];
  while (next) {
    next.searchParams.delete('access_token');
    const response = await fetchFn(next, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new MetaAdsInsightsError(response.status);

    const body = (await response.json()) as {
      data?: MetaInsightRow[];
      paging?: { next?: string };
    };
    for (const row of body.data ?? []) {
      const metric = toMetric(row);
      if (metric) metrics.push(metric);
    }

    if (!body.paging?.next) break;
    const candidate = new URL(body.paging.next);
    if (candidate.origin !== 'https://graph.facebook.com') break;
    candidate.searchParams.delete('access_token');
    next = candidate;
  }

  return metrics;
}
