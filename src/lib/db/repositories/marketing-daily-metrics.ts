import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { marketingDailyMetrics } from '../schema';

export type MarketingDailyMetricRow = typeof marketingDailyMetrics.$inferSelect;

export type MarketingDailyMetricInput = {
  provider: string;
  source?: string;
  currency?: string;
  metricDate: string;
  campaignId?: string;
  campaignName?: string;
  adsetId?: string;
  adsetName?: string;
  adId?: string;
  adName?: string;
  spendCents?: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
};

function nonNegativeInteger(value: number | undefined): number {
  return Math.max(0, Math.round(value ?? 0));
}

function assertMetricDate(metricDate: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metricDate)) {
    throw new Error('metricDate must use YYYY-MM-DD format');
  }
}

export async function upsertMarketingDailyMetric(
  db: Db,
  input: MarketingDailyMetricInput
): Promise<number> {
  assertMetricDate(input.metricDate);
  const now = new Date();
  const dimensions = {
    provider: input.provider.trim(),
    source: input.source?.trim() ?? '',
    metricDate: input.metricDate,
    campaignId: input.campaignId?.trim() ?? '',
    adsetId: input.adsetId?.trim() ?? '',
    adId: input.adId?.trim() ?? ''
  };
  if (!dimensions.provider) throw new Error('provider is required');

  const [row] = await db
    .insert(marketingDailyMetrics)
    .values({
      ...dimensions,
      currency: /^[A-Z]{3}$/.test(input.currency ?? '') ? input.currency : 'EUR',
      campaignName: input.campaignName ?? '',
      adsetName: input.adsetName ?? '',
      adName: input.adName ?? '',
      spendCents: nonNegativeInteger(input.spendCents),
      impressions: nonNegativeInteger(input.impressions),
      clicks: nonNegativeInteger(input.clicks),
      leads: nonNegativeInteger(input.leads),
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [
        marketingDailyMetrics.provider,
        marketingDailyMetrics.source,
        marketingDailyMetrics.metricDate,
        marketingDailyMetrics.campaignId,
        marketingDailyMetrics.adsetId,
        marketingDailyMetrics.adId
      ],
      set: {
        campaignName: input.campaignName ?? '',
        currency: /^[A-Z]{3}$/.test(input.currency ?? '') ? input.currency : 'EUR',
        adsetName: input.adsetName ?? '',
        adName: input.adName ?? '',
        spendCents: nonNegativeInteger(input.spendCents),
        impressions: nonNegativeInteger(input.impressions),
        clicks: nonNegativeInteger(input.clicks),
        leads: nonNegativeInteger(input.leads),
        updatedAt: now
      }
    })
    .returning({ id: marketingDailyMetrics.id });
  return row.id;
}

export async function upsertMarketingDailyMetrics(
  db: Db,
  inputs: MarketingDailyMetricInput[]
): Promise<number[]> {
  const ids: number[] = [];
  for (const input of inputs) ids.push(await upsertMarketingDailyMetric(db, input));
  return ids;
}

export type MarketingMetricFilters = {
  dateFrom: string;
  dateTo: string;
  provider?: string;
  source?: string;
  campaignId?: string;
};

function metricFilter(input: MarketingMetricFilters) {
  assertMetricDate(input.dateFrom);
  assertMetricDate(input.dateTo);
  return and(
    gte(marketingDailyMetrics.metricDate, input.dateFrom),
    lte(marketingDailyMetrics.metricDate, input.dateTo),
    input.provider ? eq(marketingDailyMetrics.provider, input.provider) : undefined,
    input.source ? eq(marketingDailyMetrics.source, input.source) : undefined,
    input.campaignId ? eq(marketingDailyMetrics.campaignId, input.campaignId) : undefined
  );
}

export async function getMarketingDailyMetrics(
  db: Db,
  input: MarketingMetricFilters
): Promise<MarketingDailyMetricRow[]> {
  return db
    .select()
    .from(marketingDailyMetrics)
    .where(metricFilter(input))
    .orderBy(asc(marketingDailyMetrics.metricDate), asc(marketingDailyMetrics.id));
}

export type MarketingMetricTotals = {
  spendCents: number;
  impressions: number;
  clicks: number;
  leads: number;
  costPerLeadCents: number | null;
};

export async function getMarketingMetricTotals(
  db: Db,
  input: MarketingMetricFilters
): Promise<MarketingMetricTotals> {
  const [row] = await db
    .select({
      spendCents: sql<number>`coalesce(sum(${marketingDailyMetrics.spendCents}), 0)`,
      impressions: sql<number>`coalesce(sum(${marketingDailyMetrics.impressions}), 0)`,
      clicks: sql<number>`coalesce(sum(${marketingDailyMetrics.clicks}), 0)`,
      leads: sql<number>`coalesce(sum(${marketingDailyMetrics.leads}), 0)`
    })
    .from(marketingDailyMetrics)
    .where(metricFilter(input));
  const totals = {
    spendCents: Number(row.spendCents),
    impressions: Number(row.impressions),
    clicks: Number(row.clicks),
    leads: Number(row.leads)
  };
  return {
    ...totals,
    costPerLeadCents: totals.leads > 0 ? Math.round(totals.spendCents / totals.leads) : null
  };
}
