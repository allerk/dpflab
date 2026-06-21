import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { db } from '$lib/db/index.js';
import {
  getPricingRows,
  createPricingItem,
  deletePricingItem,
  reorderPricingItem
} from '$lib/db/repositories/pricing.js';
import { makeLangStr, getLang } from '$lib/db/langstr.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const raw = await getPricingRows(db);
  const rows = raw.map((r) => ({
    id: r.id,
    icon: r.icon,
    price: r.price,
    sortOrder: r.sortOrder,
    titleRu: getLang(r.title, 'ru')
  }));
  return { rows };
};

export const actions: Actions = {
  create: async (event) => {
    const { email } = requireAdmin(event);
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

    await createPricingItem(db, {
      icon,
      title: makeLangStr({ ru: titleRu, et: titleEt }),
      price,
      cta: makeLangStr({ ru: ctaRu, et: ctaEt })
    });
    console.info(`[admin] action=create domain=pricing email=${email}`);
    redirect(303, '/admin/pricing');
  },

  delete: async (event) => {
    const { email } = requireAdmin(event);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await deletePricingItem(db, id);
    console.info(`[admin] action=delete domain=pricing id=${id} email=${email}`);
    redirect(303, '/admin/pricing');
  },

  moveUp: async (event) => {
    const { email } = requireAdmin(event);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderPricingItem(db, id, 'up');
    console.info(`[admin] action=moveUp domain=pricing id=${id} email=${email}`);
    redirect(303, '/admin/pricing');
  },

  moveDown: async (event) => {
    const { email } = requireAdmin(event);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderPricingItem(db, id, 'down');
    console.info(`[admin] action=moveDown domain=pricing id=${id} email=${email}`);
    redirect(303, '/admin/pricing');
  }
};
