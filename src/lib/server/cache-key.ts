const TRACKING_QUERY_KEYS = new Set([
  'fbclid',
  'gclid',
  'msclkid',
  'campaign_id',
  'campaignid',
  'adset_id',
  'adsetid',
  'ad_id',
  'adid',
  '_gl'
]);

export function publicCacheUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_') || TRACKING_QUERY_KEYS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  url.searchParams.sort();
  return url.toString();
}
