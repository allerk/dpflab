import { describe, expect, it } from 'vitest';
import {
  buildAutomotiveBusinessJsonLd,
  GOOGLE_BUSINESS_PROFILE_URL
} from '../src/lib/seo/local-business';

const contacts = {
  phone: '+372 5555 5014',
  email: 'info@dpflab.ee',
  weekdaysOpen: '09:00',
  weekdaysClose: '18:00',
  saturdayOpen: '10:00',
  saturdayClose: '15:00'
};

describe('buildAutomotiveBusinessJsonLd', () => {
  it('connects the canonical business entity to the verified Google profile', () => {
    const value = buildAutomotiveBusinessJsonLd({
      baseUrl: 'https://dpflab.ee',
      imageUrl: 'https://dpflab.ee/hero.webp',
      contacts
    });

    expect(value['@id']).toBe('https://dpflab.ee/#business');
    expect(value.url).toBe('https://dpflab.ee/');
    expect(value.sameAs).toEqual([GOOGLE_BUSINESS_PROFILE_URL]);
    expect(value.hasMap).toBe(GOOGLE_BUSINESS_PROFILE_URL);
  });

  it('publishes only the opening hours shown on the site', () => {
    const value = buildAutomotiveBusinessJsonLd({
      baseUrl: 'https://dpflab.ee',
      imageUrl: 'https://dpflab.ee/hero.webp',
      contacts
    });

    expect(value.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '15:00'
      }
    ]);
  });

  it('does not invent Saturday hours when the site has none', () => {
    const value = buildAutomotiveBusinessJsonLd({
      baseUrl: 'https://dpflab.ee',
      imageUrl: 'https://dpflab.ee/hero.webp',
      contacts: { ...contacts, saturdayOpen: null, saturdayClose: null }
    });

    expect(value.openingHoursSpecification).toHaveLength(1);
  });
});
