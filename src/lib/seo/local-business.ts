export const GOOGLE_BUSINESS_PROFILE_URL =
  'https://www.google.com/maps?cid=17809777249294467480';

type BusinessContacts = {
  phone: string;
  email: string;
  weekdaysOpen: string;
  weekdaysClose: string;
  saturdayOpen: string | null;
  saturdayClose: string | null;
};

type LocalBusinessInput = {
  baseUrl: string;
  imageUrl: string;
  contacts: BusinessContacts | null;
};

export function buildAutomotiveBusinessJsonLd({
  baseUrl,
  imageUrl,
  contacts
}: LocalBusinessInput) {
  const weekdaysOpen = contacts?.weekdaysOpen ?? '09:00';
  const weekdaysClose = contacts?.weekdaysClose ?? '18:00';
  const saturdayOpen = contacts ? contacts.saturdayOpen : '10:00';
  const saturdayClose = contacts ? contacts.saturdayClose : '15:00';

  const openingHoursSpecification: Array<Record<string, unknown>> = [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: weekdaysOpen,
      closes: weekdaysClose
    }
  ];

  if (saturdayOpen && saturdayClose) {
    openingHoursSpecification.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: saturdayOpen,
      closes: saturdayClose
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    '@id': `${baseUrl}/#business`,
    name: 'DPFLAB',
    alternateName: 'Dpflab.ee',
    url: `${baseUrl}/`,
    image: imageUrl,
    telephone: contacts?.phone ?? '+372 5555 5014',
    email: contacts?.email ?? 'info@dpflab.ee',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Saha-Loo tee 36',
      addressLocality: 'Iru',
      postalCode: '74206',
      addressCountry: 'EE'
    },
    openingHoursSpecification,
    sameAs: [GOOGLE_BUSINESS_PROFILE_URL],
    hasMap: GOOGLE_BUSINESS_PROFILE_URL
  };
}
