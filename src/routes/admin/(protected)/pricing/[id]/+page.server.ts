import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import { getPricingRows, updatePricingItem } from '$lib/db/repositories/pricing.js';
import { makeLangStr, getLang } from '$lib/db/langstr.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const id = parseInt(event.params.id, 10);
  if (isNaN(id)) error(404, 'Not found');

  const rows = await getPricingRows(db);
  const row = rows.find((r) => r.id === id);
  if (!row) error(404, 'Not found');

  return {
    row: {
      id: row.id,
      icon: row.icon,
      titleRu: getLang(row.title, 'ru'),
      titleEt: getLang(row.title, 'et'),
      price: row.price,
      ctaRu: getLang(row.cta, 'ru'),
      ctaEt: getLang(row.cta, 'et')
    }
  };
};

export const actions: Actions = {
  update: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = parseInt(event.params.id, 10);
    if (isNaN(id)) error(404, 'Not found');

    const data = await event.request.formData();
    const icon = (data.get('icon') as string)?.trim() ?? '';
    const titleRu = (data.get('title_ru') as string)?.trim() ?? '';
    const titleEt = (data.get('title_et') as string)?.trim() ?? '';
    const price = (data.get('price') as string)?.trim() ?? '';
    const ctaRu = (data.get('cta_ru') as string)?.trim() ?? '';
    const ctaEt = (data.get('cta_et') as string)?.trim() ?? '';

    const errors: Record<string, string> = {};
    if (!icon) errors.icon = 'required';
    if (!titleRu) errors.title_ru = 'required';
    if (!titleEt) errors.title_et = 'required';
    if (!price) errors.price = 'required';
    if (!ctaRu) errors.cta_ru = 'required';
    if (!ctaEt) errors.cta_et = 'required';

    if (Object.keys(errors).length) {
      return fail(400, { errors, values: { icon, titleRu, titleEt, price, ctaRu, ctaEt } });
    }

    await updatePricingItem(db, id, {
      icon,
      title: makeLangStr({ ru: titleRu, et: titleEt }),
      price,
      cta: makeLangStr({ ru: ctaRu, et: ctaEt })
    });
    console.info(`[admin] action=update domain=pricing id=${id} email=${email}`);
    redirect(303, '/admin/pricing');
  }
};
