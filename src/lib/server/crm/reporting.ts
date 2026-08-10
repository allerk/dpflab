import type { SubmissionRow } from '$lib/db/repositories/contact-submissions';

const META_SOURCES = new Set([
  'meta',
  'meta_paid',
  'meta_organic',
  'meta_unknown',
  'facebook',
  'instagram',
  'fb',
  'ig'
]);

const normalized = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

export function isMetaAttributedLead(row: Pick<SubmissionRow,
  'origin' | 'source' | 'utmSource' | 'utmMedium' | 'fbclid' | 'fbc'
>): boolean {
  if (row.origin === 'meta_instant') return true;
  if (META_SOURCES.has(normalized(row.source)) || META_SOURCES.has(normalized(row.utmSource))) {
    return true;
  }
  return Boolean(row.fbclid || row.fbc || /(?:paid_?social|social|instant_?form)/.test(normalized(row.utmMedium)));
}

/** Paid Meta revenue requires an explicit paid marker or campaign-level attribution. */
export function isPaidMetaLead(row: Pick<SubmissionRow,
  'origin' | 'source' | 'utmSource' | 'utmMedium' | 'fbclid' | 'fbc' | 'campaignId' | 'adId'
>): boolean {
  if (!isMetaAttributedLead(row)) return false;
  const source = normalized(row.source);
  if (source === 'meta_organic') return false;
  if (source === 'meta_paid') return true;
  return Boolean(row.campaignId || row.adId || row.fbclid || row.fbc || /paid_?social/.test(normalized(row.utmMedium)));
}
