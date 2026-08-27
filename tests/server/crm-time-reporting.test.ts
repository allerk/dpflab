import { describe, expect, it } from 'vitest';
import {
  formatTallinnDate,
  parseTallinnDateTimeLocal,
  shiftCalendarDate,
  tallinnReportingPeriod
} from '../../src/lib/server/crm/tallinn-time';
import { isMetaAttributedLead, isPaidMetaLead } from '../../src/lib/server/crm/reporting';

describe('Tallinn workshop time', () => {
  it('converts ordinary winter and summer wall times', () => {
    expect(parseTallinnDateTimeLocal('2026-01-15T10:30')?.toISOString()).toBe('2026-01-15T08:30:00.000Z');
    expect(parseTallinnDateTimeLocal('2026-08-15T10:30')?.toISOString()).toBe('2026-08-15T07:30:00.000Z');
  });

  it('rejects invalid calendar dates and the spring DST gap', () => {
    expect(parseTallinnDateTimeLocal('2026-02-30T10:00')).toBeNull();
    expect(parseTallinnDateTimeLocal('2026-03-29T03:30')).toBeNull();
  });

  it('builds report windows from Tallinn calendar days rather than UTC days', () => {
    const now = new Date('2026-08-10T22:30:00.000Z');
    expect(formatTallinnDate(now)).toBe('2026-08-11');
    expect(shiftCalendarDate('2026-08-11', -29)).toBe('2026-07-13');
    expect(tallinnReportingPeriod(now)).toEqual({
      from: new Date('2026-07-12T21:00:00.000Z'),
      to: now,
      fromKey: '2026-07-13',
      toKey: '2026-08-11'
    });
  });

  it('uses the correct Tallinn midnight across winter offset', () => {
    const period = tallinnReportingPeriod(new Date('2026-01-15T00:30:00.000Z'), 1);
    expect(period.from.toISOString()).toBe('2026-01-14T22:00:00.000Z');
    expect(period.toKey).toBe('2026-01-15');
  });
});

describe('Meta reporting attribution', () => {
  const base = {
    origin: 'site', source: '', utmSource: '', utmMedium: '', fbclid: '', fbc: '',
    campaignId: '', adId: ''
  } as const;

  it('recognizes Facebook and Instagram UTM values', () => {
    expect(isMetaAttributedLead({ ...base, utmSource: 'instagram' } as never)).toBe(true);
  });

  it('keeps organic Meta leads out of paid ROAS', () => {
    expect(isMetaAttributedLead({ ...base, origin: 'meta_instant', source: 'meta_organic' } as never)).toBe(true);
    expect(isPaidMetaLead({ ...base, origin: 'meta_instant', source: 'meta_organic' } as never)).toBe(false);
    expect(isPaidMetaLead({ ...base, origin: 'meta_instant', source: 'meta_paid' } as never)).toBe(true);
  });
});
