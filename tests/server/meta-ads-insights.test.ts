import { describe, expect, it, vi } from 'vitest';
import {
  fetchMetaDailyMetrics,
  MetaAdsInsightsError
} from '../../src/lib/server/integrations/meta-ads-insights';

const env = {
  META_AD_ACCOUNT_ID: 'act_1488895229206352',
  META_MARKETING_ACCESS_TOKEN: 'secret-token',
  META_GRAPH_API_VERSION: 'v25.0'
};

describe('Meta Ads daily insights', () => {
  it('normalizes daily ad metrics without putting the token in the URL', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              date_start: '2026-08-09',
              account_currency: 'EUR',
              campaign_id: '10',
              campaign_name: 'Leads ET',
              adset_id: '20',
              adset_name: 'Tallinn',
              ad_id: '30',
              ad_name: 'DPF video',
              spend: '12.345',
              impressions: '1200',
              clicks: '45',
              actions: [{ action_type: 'onsite_conversion.lead_grouped', value: '3' }]
            }
          ]
        }),
        { status: 200 }
      )
    );

    await expect(
      fetchMetaDailyMetrics(env, { since: '2026-08-09', until: '2026-08-09' }, fetchFn)
    ).resolves.toEqual([
      {
        provider: 'meta',
        date: '2026-08-09',
        currency: 'EUR',
        campaignId: '10',
        campaignName: 'Leads ET',
        adsetId: '20',
        adsetName: 'Tallinn',
        adId: '30',
        adName: 'DPF video',
        spendCents: 1235,
        impressions: 1200,
        clicks: 45,
        providerLeads: 3
      }
    ]);

    const [url, init] = fetchFn.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.has('access_token')).toBe(false);
    expect(init.headers).toEqual({ Authorization: 'Bearer secret-token' });
    expect(url.searchParams.get('time_increment')).toBe('1');
  });

  it('returns no metrics when the integration is not configured', async () => {
    const fetchFn = vi.fn();
    await expect(
      fetchMetaDailyMetrics({}, { since: '2026-08-01', until: '2026-08-10' }, fetchFn)
    ).resolves.toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('does not leak the response body through errors', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'token secret-token is invalid' } }), {
        status: 401
      })
    );
    const error = await fetchMetaDailyMetrics(
      env,
      { since: '2026-08-01', until: '2026-08-10' },
      fetchFn
    ).catch((caught) => caught);
    expect(error).toBeInstanceOf(MetaAdsInsightsError);
    expect(String(error)).not.toContain('secret-token');
  });
});
