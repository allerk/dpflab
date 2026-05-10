export type Locale = 'ru' | 'ee';

export interface NavStrings {
  home: string;
  services: string;
  process: string;
  benefits: string;
  pricing: string;
  about: string;
  contacts: string;
  cta: string;
}

export interface Brand {
  name: string;
  tagline: string;
}

export interface Contacts {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  hoursWeek: string;
  hoursSat: string;
}

export interface HeroBadge { icon: string; title: string; text: string; }
export interface Hero {
  title: string[];
  titlePlain: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  badges: HeroBadge[];
  imageAlt: string;
}

export interface Why {
  title: string;
  lead: string;
  points: string[];
  footer: string;
  imageAlt: string;
}

export interface Step { icon: string; text: string; }
export interface Process { title: string; titleAccent: string; steps: Step[]; }

export interface PricingItem { icon: string; title: string; price: string; cta: string; }
export interface Pricing { title: string; titleAccent: string; items: PricingItem[]; footer: string; }

export interface BenefitItem { icon: string; text: string; }
export interface Benefits { title: string; titleAccent: string; items: BenefitItem[]; }

export interface BAPair { before: string; after: string; }
export interface Gallery { title: string; pairs: BAPair[]; labelBefore: string; labelAfter: string; }

export interface Review { stars: number; text: string; author: string; }
export interface Reviews { title: string; items: Review[]; }

export interface FaqItem { q: string; a: string; }
export interface Faq { title: string; titleAccent: string; items: FaqItem[]; }

export interface CertItem { title: string; text: string; }
export interface Certificates { title: string; titleAccent: string; items: CertItem[]; }

export interface Contact {
  title: string;
  subtitle: string;
  contactsTitle: string;
  fields: { name: string; phone: string; comment: string; submit: string; };
  success: string;
  validation: { name: string; phone: string; };
}

export interface FooterLink { label: string; href: string; }
export interface Footer { copy: string; rights: string; links: FooterLink[]; }

export interface ContentBundle {
  locale: Locale;
  nav: NavStrings;
  brand: Brand;
  contacts: Contacts;
  hero: Hero;
  why: Why;
  process: Process;
  pricing: Pricing;
  benefits: Benefits;
  gallery: Gallery;
  reviews: Reviews;
  faq: Faq;
  certificates: Certificates;
  contact: Contact;
  footer: Footer;
}
