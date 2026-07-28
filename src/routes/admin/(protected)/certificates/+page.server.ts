import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  getCertificateRows,
  createCertificate,
  deleteCertificate,
  reorderCertificate
} from '$lib/db/repositories/certificates.js';
import { makeLangStr, getLang } from '$lib/db/langstr.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const raw = await getCertificateRows(db);
  const rows = raw.map((r) => ({
    id: r.id,
    sortOrder: r.sortOrder,
    titleRu: getLang(r.title, 'ru')
  }));
  return { rows };
};

export const actions: Actions = {
  create: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const titleRu = (data.get('title_ru') as string)?.trim() ?? '';
    const titleEt = (data.get('title_et') as string)?.trim() ?? '';
    const titleEn = (data.get('title_en') as string)?.trim() ?? '';
    const textRu = (data.get('text_ru') as string)?.trim() ?? '';
    const textEt = (data.get('text_et') as string)?.trim() ?? '';
    const textEn = (data.get('text_en') as string)?.trim() ?? '';

    const errors: Record<string, string> = {};
    if (!titleRu) errors.title_ru = 'required';
    if (!titleEt) errors.title_et = 'required';
    if (!titleEn) errors.title_en = 'required';
    if (!textRu) errors.text_ru = 'required';
    if (!textEt) errors.text_et = 'required';
    if (!textEn) errors.text_en = 'required';

    if (Object.keys(errors).length) {
      return fail(400, { errors, values: { titleRu, titleEt, titleEn, textRu, textEt, textEn } });
    }

    await createCertificate(db, {
      title: makeLangStr({ ru: titleRu, et: titleEt, en: titleEn }),
      text: makeLangStr({ ru: textRu, et: textEt, en: textEn })
    });
    console.info(`[admin] action=create domain=certificates email=${email}`);
    redirect(303, '/admin/certificates');
  },

  delete: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await deleteCertificate(db, id);
    console.info(`[admin] action=delete domain=certificates id=${id} email=${email}`);
    redirect(303, '/admin/certificates');
  },

  moveUp: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderCertificate(db, id, 'up');
    console.info(`[admin] action=moveUp domain=certificates id=${id} email=${email}`);
    redirect(303, '/admin/certificates');
  },

  moveDown: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderCertificate(db, id, 'down');
    console.info(`[admin] action=moveDown domain=certificates id=${id} email=${email}`);
    redirect(303, '/admin/certificates');
  }
};
