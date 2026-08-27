import { describe, expect, it } from 'vitest';
import { prepareGoogleAdsOfflineConversion } from '../../src/lib/server/analytics/google-ads-offline';

const base = {
  stage: 'completed' as const,
  outboxEventId: 'crm-completed-42',
  occurredAt: '2026-08-10T09:58:00.000Z',
  adsMeasurementConsent: true,
  adUserDataConsent: true,
  adPersonalizationConsent: false,
  valueCents: 19_900,
  currency: 'eur'
};

describe('Google Ads offline conversion boundary', () => {
  it('prepares a Data Manager event with click IDs and hashed first-party identifiers', async () => {
    const result = await prepareGoogleAdsOfflineConversion({
      ...base,
      gclid: 'CjwKCA_example-gclid_12345',
      wbraid: 'ClIKCA_example-wbraid_12345',
      email: 'Jane.Doe+DPF@Gmail.com',
      phone: '+372 5555-5014'
    });

    expect(result.outcome).toBe('ready');
    if (result.outcome !== 'ready') return;
    expect(result.conversion).toMatchObject({
      conversionActionKey: 'completed',
      encoding: 'HEX',
      event: {
        eventTimestamp: '2026-08-10T09:58:00.000Z',
        transactionId: 'crm-completed-42',
        eventSource: 'WEB',
        adIdentifiers: {
          gclid: 'CjwKCA_example-gclid_12345',
          wbraid: 'ClIKCA_example-wbraid_12345'
        },
        consent: {
          adUserData: 'GRANTED',
          adPersonalization: 'DENIED'
        },
        conversionValue: 199,
        currency: 'EUR'
      }
    });
    const identifiers = result.conversion.event.userData?.userIdentifiers ?? [];
    expect(identifiers).toHaveLength(2);
    expect(JSON.stringify(identifiers)).not.toContain('janedoe@gmail.com');
    expect(JSON.stringify(identifiers)).not.toContain('55555014');
    for (const identifier of identifiers) {
      expect(Object.values(identifier)[0]).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('applies Google Gmail normalization before hashing', async () => {
    const withAliases = await prepareGoogleAdsOfflineConversion({
      ...base,
      email: 'Jane.Doe+DPF@Gmail.com'
    });
    const canonical = await prepareGoogleAdsOfflineConversion({
      ...base,
      email: 'janedoe@gmail.com'
    });

    expect(withAliases.outcome).toBe('ready');
    expect(canonical.outcome).toBe('ready');
    if (withAliases.outcome !== 'ready' || canonical.outcome !== 'ready') return;
    expect(withAliases.conversion.event.userData).toEqual(canonical.conversion.event.userData);
  });

  it('does not include first-party PII when ad-user-data consent is denied', async () => {
    const result = await prepareGoogleAdsOfflineConversion({
      ...base,
      adUserDataConsent: false,
      gclid: 'CjwKCA_example-gclid_12345',
      email: 'customer@example.com',
      phone: '+37255555014'
    });

    expect(result.outcome).toBe('ready');
    if (result.outcome !== 'ready') return;
    expect(result.conversion.event.userData).toBeUndefined();
    expect(result.conversion.event.consent.adUserData).toBe('DENIED');
  });

  it('defers a conversion until an eligible identifier exists', async () => {
    const result = await prepareGoogleAdsOfflineConversion({
      ...base,
      adUserDataConsent: false
    });

    expect(result).toEqual({ outcome: 'deferred', reason: 'missing_identifiers' });
  });

  it('rejects value without an ISO currency', async () => {
    const result = await prepareGoogleAdsOfflineConversion({
      ...base,
      currency: '',
      gclid: 'CjwKCA_example-gclid_12345'
    });

    expect(result).toEqual({ outcome: 'skipped', reason: 'invalid_event' });
  });
});
