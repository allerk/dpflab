import type { Db } from '../types';
import { createCrmLead, recordLeadActivity } from './contact-submissions';
import type { NormalizedMetaLead } from '$lib/server/integrations/meta-leads';

type CanonicalChoice = { value: string; locale: 'ru' | 'et' | 'en' };

const choiceMap = (groups: Array<[string, CanonicalChoice]>) =>
  new Map(groups.map(([label, choice]) => [label.trim().toLocaleLowerCase(), choice]));

const SERVICE_CHOICES = choiceMap([
  ['dpf', { value: 'dpf', locale: 'en' }],
  ['fap', { value: 'fap', locale: 'en' }],
  ['catalyst', { value: 'catalyst', locale: 'en' }],
  ['diagnosis', { value: 'diagnosis', locale: 'en' }],
  ['unsure', { value: 'other', locale: 'en' }],
  ['Очистка DPF', { value: 'dpf', locale: 'ru' }],
  ['Очистка FAP', { value: 'fap', locale: 'ru' }],
  ['Катализатор / DOC / SCR', { value: 'catalyst', locale: 'ru' }],
  ['Диагностика', { value: 'diagnosis', locale: 'ru' }],
  ['Не уверен / нужна консультация', { value: 'other', locale: 'ru' }],
  ['DPF puhastus', { value: 'dpf', locale: 'et' }],
  ['FAP puhastus', { value: 'fap', locale: 'et' }],
  ['Katalüsaator / DOC / SCR', { value: 'catalyst', locale: 'et' }],
  ['Diagnostika', { value: 'diagnosis', locale: 'et' }],
  ['Ei ole kindel / vajan nõu', { value: 'other', locale: 'et' }],
  ['DPF cleaning', { value: 'dpf', locale: 'en' }],
  ['FAP cleaning', { value: 'fap', locale: 'en' }],
  ['Catalyst / DOC / SCR', { value: 'catalyst', locale: 'en' }],
  ['Diagnostics', { value: 'diagnosis', locale: 'en' }],
  ['Not sure / need advice', { value: 'other', locale: 'en' }]
]);

const FILTER_CHOICES = choiceMap([
  ['removed', { value: 'removed', locale: 'en' }],
  ['workshop', { value: 'workshop', locale: 'en' }],
  ['installed', { value: 'installed', locale: 'en' }],
  ['unsure', { value: 'unsure', locale: 'en' }],
  ['Уже снят', { value: 'removed', locale: 'ru' }],
  ['Находится в автосервисе', { value: 'workshop', locale: 'ru' }],
  ['Установлен на автомобиле', { value: 'installed', locale: 'ru' }],
  ['Не знаю / нужна консультация', { value: 'unsure', locale: 'ru' }],
  ['Juba eemaldatud', { value: 'removed', locale: 'et' }],
  ['Asub autoteeninduses', { value: 'workshop', locale: 'et' }],
  ['On veel auto küljes', { value: 'installed', locale: 'et' }],
  ['Ei tea / vajan nõu', { value: 'unsure', locale: 'et' }],
  ['Already removed', { value: 'removed', locale: 'en' }],
  ['At a workshop', { value: 'workshop', locale: 'en' }],
  ['Still installed in the vehicle', { value: 'installed', locale: 'en' }],
  ['Not sure / need advice', { value: 'unsure', locale: 'en' }]
]);

const CLIENT_CHOICES = choiceMap([
  ['private', { value: 'private', locale: 'en' }],
  ['workshop', { value: 'workshop', locale: 'en' }],
  ['fleet', { value: 'fleet', locale: 'en' }],
  ['Владелец автомобиля', { value: 'private', locale: 'ru' }],
  ['Автосервис', { value: 'workshop', locale: 'ru' }],
  ['Компания / автопарк', { value: 'fleet', locale: 'ru' }],
  ['Auto omanik', { value: 'private', locale: 'et' }],
  ['Autoteenindus', { value: 'workshop', locale: 'et' }],
  ['Ettevõte / autopark', { value: 'fleet', locale: 'et' }],
  ['Vehicle owner', { value: 'private', locale: 'en' }],
  ['Workshop', { value: 'workshop', locale: 'en' }],
  ['Company / fleet', { value: 'fleet', locale: 'en' }]
]);

const URGENCY_CHOICES = choiceMap([
  ['today', { value: 'today', locale: 'en' }],
  ['days', { value: 'days_1_3', locale: 'en' }],
  ['week', { value: 'this_week', locale: 'en' }],
  ['consultation', { value: 'consultation', locale: 'en' }],
  ['Сегодня', { value: 'today', locale: 'ru' }],
  ['В течение 1–3 дней', { value: 'days_1_3', locale: 'ru' }],
  ['На этой неделе', { value: 'this_week', locale: 'ru' }],
  ['Пока нужна консультация', { value: 'consultation', locale: 'ru' }],
  ['Täna', { value: 'today', locale: 'et' }],
  ['1–3 päeva jooksul', { value: 'days_1_3', locale: 'et' }],
  ['Selle nädala jooksul', { value: 'this_week', locale: 'et' }],
  ['Praegu vajan ainult nõu', { value: 'consultation', locale: 'et' }],
  ['Today', { value: 'today', locale: 'en' }],
  ['Within 1–3 days', { value: 'days_1_3', locale: 'en' }],
  ['This week', { value: 'this_week', locale: 'en' }],
  ['I only need advice for now', { value: 'consultation', locale: 'en' }]
]);

const choice = (map: Map<string, CanonicalChoice>, raw: string | undefined) =>
  raw ? map.get(raw.trim().toLocaleLowerCase()) : undefined;

const supportedLocale = (locale: string | undefined): 'ru' | 'et' | 'en' | undefined => {
  const language = locale?.slice(0, 2).toLocaleLowerCase();
  return language === 'ru' || language === 'et' || language === 'en' ? language : undefined;
};

function safeMetaNote(lead: NormalizedMetaLead): string {
  const known = new Set(['service_type', 'filter_state', 'client_type', 'vehicle', 'urgency']);
  const extras = Object.entries(lead.customFields)
    .filter(([key]) => !known.has(key))
    .flatMap(([key, values]) => values.slice(0, 3).map((item) => `${key}: ${item}`));
  return extras.join('\n').slice(0, 1_500);
}

/**
 * Persists the normalized webhook result. Meta sends displayed option labels,
 * so the three form languages are translated back to the site's stable keys.
 */
export async function ingestMetaLead(
  db: Db,
  lead: NormalizedMetaLead
): Promise<{ submissionId: number; inserted: boolean }> {
  const service = choice(SERVICE_CHOICES, lead.serviceType);
  const filter = choice(FILTER_CHOICES, lead.filterState);
  const client = choice(CLIENT_CHOICES, lead.clientType);
  const urgency = choice(URGENCY_CHOICES, lead.urgency);
  const locale =
    supportedLocale(lead.locale) ??
    service?.locale ??
    filter?.locale ??
    client?.locale ??
    urgency?.locale ??
    'ru';

  const result = await createCrmLead(db, {
    origin: 'meta_instant',
    source: lead.isOrganic === true ? 'meta_organic' : lead.isOrganic === false ? 'meta_paid' : 'meta_unknown',
    externalLeadId: lead.externalLeadId,
    externalFormId: lead.formId,
    name: lead.fullName ?? `Meta lead ${lead.externalLeadId.slice(-6)}`,
    phone: lead.phone ?? '',
    email: lead.email ?? '',
    comment: safeMetaNote(lead),
    serviceType: service?.value ?? 'other',
    filterState: filter?.value ?? '',
    clientType: client?.value ?? '',
    vehicle: lead.vehicle ?? '',
    urgency: urgency?.value ?? '',
    preferredContact: lead.phone ? 'phone' : lead.email ? 'email' : '',
    utmSource: 'meta',
    utmMedium: 'instant_form',
    utmCampaign: lead.campaignName ?? '',
    campaignId: lead.campaignId ?? '',
    adsetId: lead.adsetId ?? '',
    adId: lead.adId ?? '',
    privacyVersion: 'meta-instant-form',
    analyticsConsent: false,
    locale,
    createdAt: new Date(lead.createdAt)
  });

  if (result.created) {
    await recordLeadActivity(db, {
      submissionId: result.id,
      activityType: 'meta_lead_imported',
      actor: 'meta-webhook',
      details: {
        pageId: lead.pageId,
        formId: lead.formId,
        campaignId: lead.campaignId ?? '',
        adsetId: lead.adsetId ?? '',
        adId: lead.adId ?? '',
        isOrganic: lead.isOrganic ?? null
      }
    });
  }

  return { submissionId: result.id, inserted: result.created };
}
