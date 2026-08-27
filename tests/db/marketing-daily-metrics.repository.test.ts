import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/db';
import {
  getMarketingDailyMetrics,
  getMarketingMetricTotals,
  upsertMarketingDailyMetric
} from '../../src/lib/db/repositories/marketing-daily-metrics';

describe('marketing daily metrics repository', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('upserts a unique provider/source/date/ad dimension snapshot', async () => {
    const dimensions = {
      provider: 'meta',
      source: 'facebook',
      metricDate: '2026-08-09',
      campaignId: 'campaign-1',
      adsetId: 'adset-1',
      adId: 'ad-1'
    };
    const id = await upsertMarketingDailyMetric(db, {
      ...dimensions,
      campaignName: 'Old name',
      spendCents: 1_000,
      impressions: 500,
      clicks: 10,
      leads: 1
    });
    const sameId = await upsertMarketingDailyMetric(db, {
      ...dimensions,
      campaignName: 'DPF Leads',
      currency: 'USD',
      adName: 'Estonian creative',
      spendCents: 1_250,
      impressions: 600,
      clicks: 15,
      leads: 2
    });

    expect(sameId).toBe(id);
    const rows = await getMarketingDailyMetrics(db, {
      dateFrom: '2026-08-09',
      dateTo: '2026-08-09'
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      campaignName: 'DPF Leads',
      currency: 'USD',
      adName: 'Estonian creative',
      spendCents: 1_250,
      leads: 2
    });
  });

  it('aggregates reporting totals and CPL with provider filters', async () => {
    await upsertMarketingDailyMetric(db, {
      provider: 'meta',
      source: 'facebook',
      metricDate: '2026-08-08',
      campaignId: 'campaign-1',
      spendCents: 1_000,
      impressions: 400,
      clicks: 10,
      leads: 1
    });
    await upsertMarketingDailyMetric(db, {
      provider: 'meta',
      source: 'facebook',
      metricDate: '2026-08-09',
      campaignId: 'campaign-1',
      spendCents: 2_000,
      impressions: 600,
      clicks: 20,
      leads: 2
    });
    await upsertMarketingDailyMetric(db, {
      provider: 'google',
      source: 'search',
      metricDate: '2026-08-09',
      spendCents: 9_999,
      leads: 1
    });

    await expect(getMarketingMetricTotals(db, {
      dateFrom: '2026-08-08',
      dateTo: '2026-08-09',
      provider: 'meta'
    })).resolves.toEqual({
      spendCents: 3_000,
      impressions: 1_000,
      clicks: 30,
      leads: 3,
      costPerLeadCents: 1_000
    });
  });

  it('rejects non-ISO metric dates', async () => {
    await expect(upsertMarketingDailyMetric(db, {
      provider: 'meta',
      metricDate: '09/08/2026'
    })).rejects.toThrow('metricDate must use YYYY-MM-DD format');
  });
});
